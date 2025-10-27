<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Company;
use App\Models\AuditLog;
use Tests\TestCase;

class CompanyTest extends TestCase
{
    public function test_user_can_verify_ssm_successfully()
    {
        $user = $this->createUser();
        $this->actingAsUser($user);

        // Use SSM starting with "SSM-" for active status
        $response = $this->postJson('/api/company/verify-ssm', [
            'ssm_no' => 'SSM-123456'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'company' => [
                    'id',
                    'ssm_no',
                    'name',
                    'status'
                ]
            ])
            ->assertJson([
                'company' => [
                    'ssm_no' => 'SSM-123456',
                    'status' => 'active'
                ]
            ]);

        // Check company created in database
        $this->assertDatabaseHas('companies', [
            'ssm_no' => 'SSM-123456',
            'status' => 'active'
        ]);

        // Check audit log creation
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'company_verified',
            'entity_type' => 'App\\Models\\Company'
        ]);
    }

    public function test_user_can_verify_inactive_ssm()
    {
        $user = $this->createUser();
        $this->actingAsUser($user);

        // Use SSM not starting with "SSM-" for inactive status
        $response = $this->postJson('/api/company/verify-ssm', [
            'ssm_no' => 'ABC-123456'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'company' => [
                    'ssm_no' => 'ABC-123456',
                    'status' => 'inactive'
                ]
            ]);

        // Check company created with inactive status
        $this->assertDatabaseHas('companies', [
            'ssm_no' => 'ABC-123456',
            'status' => 'inactive'
        ]);
    }

    public function test_ssm_verification_validation_errors()
    {
        $user = $this->createUser();
        $this->actingAsUser($user);

        // Test missing SSM number
        $response = $this->postJson('/api/company/verify-ssm', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ssm_no']);

        // Test empty SSM number
        $response = $this->postJson('/api/company/verify-ssm', [
            'ssm_no' => ''
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ssm_no']);

        // Test SSM number too long
        $response = $this->postJson('/api/company/verify-ssm', [
            'ssm_no' => str_repeat('A', 51)
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ssm_no']);
    }

    public function test_ssm_verification_requires_authentication()
    {
        $response = $this->postJson('/api/company/verify-ssm', [
            'ssm_no' => 'SSM-123456'
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_user_can_link_to_company_successfully()
    {
        $user = $this->createUser();
        $company = $this->createCompany(['owner_user_id' => null, 'status' => 'active']);
        
        $this->actingAsUser($user);

        $response = $this->postJson('/api/company/link', [
            'company_id' => $company->id
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Company linked successfully'
            ])
            ->assertJsonStructure([
                'company' => [
                    'id',
                    'ssm_no',
                    'name',
                    'status',
                    'owner_user_id'
                ]
            ]);

        // Check company ownership updated
        $company->refresh();
        $this->assertEquals($user->id, $company->owner_user_id);

        // Check audit log creation
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'company_linked',
            'entity_type' => 'App\\Models\\Company',
            'entity_id' => $company->id
        ]);
    }

    public function test_user_cannot_link_to_already_owned_company()
    {
        $owner = $this->createUser(['role' => 'PEMOHON']);
        $user = $this->createUser(['role' => 'PEMOHON']);
        $company = $this->createCompany(['owner_user_id' => $owner->id, 'status' => 'active']);
        
        $this->actingAsUser($user);

        $response = $this->postJson('/api/company/link', [
            'company_id' => $company->id
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);

        // Check company ownership unchanged
        $company->refresh();
        $this->assertEquals($owner->id, $company->owner_user_id);
    }

    public function test_admin_can_link_to_any_company()
    {
        $owner = $this->createUser(['role' => 'PEMOHON']);
        $admin = $this->createUser(['role' => 'PENTADBIR_SYS']);
        $company = $this->createCompany(['owner_user_id' => $owner->id, 'status' => 'active']);
        
        $this->actingAsUser($admin);

        $response = $this->postJson('/api/company/link', [
            'company_id' => $company->id
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Company linked successfully'
            ]);

        // Check company ownership updated to admin
        $company->refresh();
        $this->assertEquals($admin->id, $company->owner_user_id);
    }

    public function test_company_linking_validation_errors()
    {
        $user = $this->createUser();
        $this->actingAsUser($user);

        // Test missing company_id
        $response = $this->postJson('/api/company/link', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['company_id']);

        // Test invalid company_id
        $response = $this->postJson('/api/company/link', [
            'company_id' => 'invalid'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['company_id']);

        // Test non-existent company_id
        $response = $this->postJson('/api/company/link', [
            'company_id' => 99999
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['company_id']);
    }

    public function test_company_linking_requires_authentication()
    {
        $company = $this->createCompany();

        $response = $this->postJson('/api/company/link', [
            'company_id' => $company->id
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_existing_ssm_verification_updates_company()
    {
        $user = $this->createUser();
        $this->actingAsUser($user);

        // Create existing company with unknown status
        $existingCompany = $this->createCompany([
            'ssm_no' => 'SSM-FEATURE-TEST',
            'status' => 'unknown'
        ]);

        // Verify the same SSM number
        $response = $this->postJson('/api/company/verify-ssm', [
            'ssm_no' => 'SSM-FEATURE-TEST'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'company' => [
                    'id' => $existingCompany->id,
                    'ssm_no' => 'SSM-FEATURE-TEST',
                    'status' => 'active'
                ]
            ]);

        // Check company status updated
        $existingCompany->refresh();
        $this->assertEquals('active', $existingCompany->status);
    }

    public function test_audit_logs_contain_proper_metadata()
    {
        $user = $this->createUser();
        $this->actingAsUser($user);

        // Test SSM verification audit log
        $response = $this->postJson('/api/company/verify-ssm', [
            'ssm_no' => 'SSM-TEST-123'
        ]);

        $auditLog = AuditLog::where('action', 'company_verified')->latest()->first();
        $this->assertNotNull($auditLog);
        $this->assertEquals('SSM-TEST-123', $auditLog->meta['ssm_no']);
        $this->assertEquals('active', $auditLog->meta['verification_status']);

        // Test company linking audit log
        $company = Company::where('ssm_no', 'SSM-TEST-123')->first();
        $response = $this->postJson('/api/company/link', [
            'company_id' => $company->id
        ]);

        $auditLog = AuditLog::where('action', 'company_linked')->latest()->first();
        $this->assertNotNull($auditLog);
        $this->assertEquals($company->id, $auditLog->meta['company_id']);
        $this->assertEquals($user->id, $auditLog->actor_id);
    }
}