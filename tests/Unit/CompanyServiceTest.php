<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Company;
use App\Models\AuditLog;
use App\Services\CompanyService;
use Tests\TestCase;

class CompanyServiceTest extends TestCase
{
    private CompanyService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(CompanyService::class);
    }

    public function test_verify_and_create_company_with_ssm_prefix_returns_active()
    {
        $company = $this->service->verifyAndCreateCompany('SSM-999999');

        $this->assertInstanceOf(Company::class, $company);
        $this->assertEquals('SSM-999999', $company->ssm_no);
        $this->assertEquals('active', $company->status);
        $this->assertStringContainsString('SSM99999', $company->name);
    }

    public function test_verify_and_create_company_without_ssm_prefix_returns_inactive()
    {
        $company = $this->service->verifyAndCreateCompany('ABC-999999');

        $this->assertInstanceOf(Company::class, $company);
        $this->assertEquals('ABC-999999', $company->ssm_no);
        $this->assertEquals('inactive', $company->status);
        $this->assertStringContainsString('ABC99999', $company->name);
    }

    public function test_verify_and_create_company_updates_existing_company()
    {
        // Create existing company with unknown status
        $existingCompany = $this->createCompany([
            'ssm_no' => 'SSM-888888',
            'status' => 'unknown'
        ]);

        $company = $this->service->verifyAndCreateCompany('SSM-888888');

        $this->assertEquals($existingCompany->id, $company->id);
        $this->assertEquals('active', $company->status);
    }

    public function test_verify_and_create_company_creates_audit_log()
    {
        $user = $this->createUser();
        $this->actingAs($user);

        $company = $this->service->verifyAndCreateCompany('SSM-777777', $user);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'company_verified',
            'entity_type' => 'App\\Models\\Company',
            'entity_id' => $company->id
        ]);
    }

    public function test_link_user_to_company_sets_ownership()
    {
        $user = $this->createUser();
        $company = $this->createCompany(['owner_user_id' => null, 'status' => 'active']);

        $this->service->linkUserToCompany($user, $company->id);

        $company->refresh();
        $this->assertEquals($user->id, $company->owner_user_id);
    }

    public function test_link_user_to_company_creates_audit_log()
    {
        $user = $this->createUser();
        $company = $this->createCompany(['owner_user_id' => null, 'status' => 'active']);

        $this->service->linkUserToCompany($user, $company->id);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'company_linked',
            'entity_type' => 'App\\Models\\Company',
            'entity_id' => $company->id
        ]);
    }

    public function test_link_user_to_company_audit_log_contains_metadata()
    {
        $user = $this->createUser();
        $company = $this->createCompany(['owner_user_id' => null, 'status' => 'active']);

        $this->service->linkUserToCompany($user, $company->id);

        $auditLog = AuditLog::where('action', 'company_linked')
            ->where('entity_id', $company->id)
            ->latest()
            ->first();

        $this->assertNotNull($auditLog);
        $this->assertEquals($company->id, $auditLog->meta['company_id']);
        $this->assertEquals($user->id, $auditLog->actor_id);
    }

    public function test_verify_and_create_company_audit_log_contains_metadata()
    {
        $user = $this->createUser();
        $this->actingAs($user);

        $company = $this->service->verifyAndCreateCompany('TEST-123456', $user);

        $auditLog = AuditLog::where('action', 'company_verified')
            ->where('entity_id', $company->id)
            ->latest()
            ->first();

        $this->assertNotNull($auditLog);
        $this->assertEquals('TEST-123456', $auditLog->meta['ssm_no']);
        $this->assertEquals('inactive', $auditLog->meta['verification_status']);
    }

    public function test_company_name_generation_includes_ssm_number()
    {
        $company1 = $this->service->verifyAndCreateCompany('SSM-UNIQUE-123');
        $company2 = $this->service->verifyAndCreateCompany('ABC-UNIQUE-456');

        $this->assertStringContainsString('SSMUNIQU', $company1->name);
        $this->assertStringContainsString('ABCUNIQU', $company2->name);
        $this->assertNotEquals($company1->name, $company2->name);
    }

    public function test_link_user_to_company_overwrites_existing_ownership()
    {
        $originalOwner = $this->createUser();
        $newOwner = $this->createUser(['role' => 'PENTADBIR_SYS']);
        $company = $this->createCompany(['owner_user_id' => $originalOwner->id, 'status' => 'active']);

        $this->service->linkUserToCompany($newOwner, $company->id);

        $company->refresh();
        $this->assertEquals($newOwner->id, $company->owner_user_id);
        $this->assertNotEquals($originalOwner->id, $company->owner_user_id);
    }

    public function test_verify_and_create_company_handles_various_ssm_formats()
    {
        $testCases = [
            'SSM-123' => 'active',
            'SSM-ABC-123' => 'active',
            'ssm-lowercase' => 'active', // Converted to uppercase, so matches SSM- prefix
            'ABC-123' => 'inactive',
            '123456' => 'inactive',
            'COMPANY-SSM-123' => 'inactive' // SSM not at start
        ];

        foreach ($testCases as $ssmNo => $expectedStatus) {
            $company = $this->service->verifyAndCreateCompany($ssmNo);
            $this->assertEquals($expectedStatus, $company->status, "Failed for SSM: {$ssmNo}");
        }
    }
}