<?php

namespace Tests\Feature\M02;

use App\Models\Company;
use App\Models\Permohonan;
use App\Models\PermohonanDokumen;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Enable MODULE_M02 feature flag by default
        config(['features.MODULE_M02' => true]);
        
        // Set up fake storage for document tests
        Storage::fake('local');
    }

    /**
     * Test ownership enforcement - users cannot access other users' applications
     * Requirements: 6.3, 11.1
     */
    public function test_cannot_view_other_users_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $otherUser = User::factory()->verified()->pemohon()->create();
        $permohonan = Permohonan::factory()->forUser($otherUser)->draf()->create();
        
        $this->actingAsUser($user);

        $response = $this->getJson("/api/m02/permohonan/{$permohonan->id}");

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);
    }

    /**
     * Test ownership enforcement - cannot update other user's application
     * Requirements: 6.3, 11.1
     */
    public function test_cannot_update_other_users_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $otherUser = User::factory()->verified()->pemohon()->create();
        $permohonan = Permohonan::factory()->forUser($otherUser)->draf()->create();
        
        $this->actingAsUser($user);

        $updateData = [
            'jenis_lesen_id' => 2,
        ];

        $response = $this->putJson("/api/m02/permohonan/{$permohonan->id}", $updateData);

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);
    }

    /**
     * Test ownership enforcement - cannot submit other user's application
     * Requirements: 6.3, 11.1
     */
    public function test_cannot_submit_other_users_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $otherUser = User::factory()->verified()->pemohon()->create();
        $permohonan = Permohonan::factory()->forUser($otherUser)->draf()->create();
        
        $this->actingAsUser($user);

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/submit");

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);
    }

    /**
     * Test ownership enforcement - cannot cancel other user's application
     * Requirements: 6.3, 11.1
     */
    public function test_cannot_cancel_other_users_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $otherUser = User::factory()->verified()->pemohon()->create();
        $permohonan = Permohonan::factory()->forUser($otherUser)->draf()->create();
        
        $this->actingAsUser($user);

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/cancel", [
            'reason' => 'Test reason',
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);
    }

    /**
     * Test ownership enforcement - cannot upload document to other user's application
     * Requirements: 6.3, 11.1
     */
    public function test_cannot_upload_document_to_other_users_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $otherUser = User::factory()->verified()->pemohon()->create();
        $permohonan = Permohonan::factory()->forUser($otherUser)->draf()->create();
        
        $this->actingAsUser($user);

        $file = UploadedFile::fake()->create('test.pdf', 1024, 'application/pdf');

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 1,
            'file' => $file,
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);
    }

    /**
     * Test ownership enforcement - cannot delete other user's document
     * Requirements: 6.3, 11.1
     */
    public function test_cannot_delete_other_users_document()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $otherUser = User::factory()->verified()->pemohon()->create();
        $permohonan = Permohonan::factory()->forUser($otherUser)->draf()->create();
        
        $dokumen = PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->uploadedBy($otherUser)
            ->create();
        
        $this->actingAsUser($user);

        $response = $this->deleteJson("/api/m02/permohonan/{$permohonan->id}/dokumen/{$dokumen->id}");

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);
    }

    /**
     * Test status-based restrictions - cannot update submitted application
     * Requirements: 6.1, 6.2, 9.1, 9.2
     */
    public function test_cannot_update_submitted_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $permohonan = Permohonan::factory()->forUser($user)->diserahkan()->create();
        
        $this->actingAsUser($user);

        $updateData = [
            'jenis_lesen_id' => 2,
        ];

        $response = $this->putJson("/api/m02/permohonan/{$permohonan->id}", $updateData);

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);
    }

    /**
     * Test status-based restrictions - cannot cancel submitted application
     * Requirements: 6.1, 6.2, 9.1, 9.2
     */
    public function test_cannot_cancel_submitted_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $permohonan = Permohonan::factory()->forUser($user)->diserahkan()->create();
        
        $this->actingAsUser($user);

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/cancel", [
            'reason' => 'Changed my mind',
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);

        // Verify status unchanged
        $permohonan->refresh();
        $this->assertEquals('Diserahkan', $permohonan->status);
    }

    /**
     * Test status-based restrictions - can view submitted application
     * Requirements: 6.1, 6.2, 9.1, 9.2
     */
    public function test_can_view_submitted_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->diserahkan()->create();
        
        $this->actingAsUser($user);

        $response = $this->getJson("/api/m02/permohonan/{$permohonan->id}");

        $response->assertStatus(200)
            ->assertJson([
                'permohonan' => [
                    'id' => $permohonan->id,
                    'status' => 'Diserahkan',
                ],
            ]);
    }

    /**
     * Test status-based restrictions - cannot upload document to submitted application
     * Requirements: 6.1, 6.2
     */
    public function test_cannot_upload_document_to_submitted_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->diserahkan()->create();
        
        $this->actingAsUser($user);

        $file = UploadedFile::fake()->create('test.pdf', 1024, 'application/pdf');

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 1,
            'file' => $file,
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);
    }

    /**
     * Test status-based restrictions - cannot delete document from submitted application
     * Requirements: 6.1, 6.2
     */
    public function test_cannot_delete_document_from_submitted_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->diserahkan()->create();
        
        $dokumen = PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->uploadedBy($user)
            ->create();
        
        $this->actingAsUser($user);

        $response = $this->deleteJson("/api/m02/permohonan/{$permohonan->id}/dokumen/{$dokumen->id}");

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);

        // Verify document still exists
        $this->assertDatabaseHas('permohonan_dokumen', [
            'id' => $dokumen->id,
        ]);
    }

    /**
     * Test status-based restrictions - cannot update cancelled application
     * Requirements: 6.1, 6.2
     */
    public function test_cannot_update_cancelled_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $permohonan = Permohonan::factory()->forUser($user)->dibatalkan()->create();
        
        $this->actingAsUser($user);

        $updateData = [
            'jenis_lesen_id' => 2,
        ];

        $response = $this->putJson("/api/m02/permohonan/{$permohonan->id}", $updateData);

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);
    }

    /**
     * Test status-based restrictions - can view cancelled application
     * Requirements: 6.1, 6.2
     */
    public function test_can_view_cancelled_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->dibatalkan()->create();
        
        $this->actingAsUser($user);

        $response = $this->getJson("/api/m02/permohonan/{$permohonan->id}");

        $response->assertStatus(200)
            ->assertJson([
                'permohonan' => [
                    'id' => $permohonan->id,
                    'status' => 'Dibatalkan',
                ],
            ]);
    }

    /**
     * Test feature flag middleware - endpoints return 404 when MODULE_M02 is disabled
     * Requirements: 12.1, 12.2
     */
    public function test_endpoints_disabled_when_feature_flag_is_false()
    {
        // Disable MODULE_M02 feature flag
        config(['features.MODULE_M02' => false]);
        
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $this->actingAsUser($user);

        // Test create endpoint - middleware returns 404 when feature is disabled
        $response = $this->postJson('/api/m02/permohonan', [
            'company_id' => $company->id,
            'jenis_lesen_id' => 1,
            'butiran_operasi' => [
                'alamat_premis' => [
                    'alamat_1' => 'Test',
                    'bandar' => 'Test',
                    'poskod' => '50000',
                    'negeri' => 'Test',
                ],
                'nama_perniagaan' => 'Test',
            ],
        ]);
        $response->assertStatus(404);

        // Test list endpoint
        $response = $this->getJson('/api/m02/permohonan');
        $response->assertStatus(404);

        // Test show endpoint
        $response = $this->getJson("/api/m02/permohonan/{$permohonan->id}");
        $response->assertStatus(404);

        // Test update endpoint
        $response = $this->putJson("/api/m02/permohonan/{$permohonan->id}", []);
        $response->assertStatus(404);

        // Test submit endpoint
        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/submit");
        $response->assertStatus(404);

        // Test cancel endpoint
        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/cancel", []);
        $response->assertStatus(404);

        // Test document upload endpoint
        $file = UploadedFile::fake()->create('test.pdf', 1024, 'application/pdf');
        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 1,
            'file' => $file,
        ]);
        $response->assertStatus(404);

        // Test document delete endpoint
        $dokumen = PermohonanDokumen::factory()->forPermohonan($permohonan)->uploadedBy($user)->create();
        $response = $this->deleteJson("/api/m02/permohonan/{$permohonan->id}/dokumen/{$dokumen->id}");
        $response->assertStatus(404);
    }

    /**
     * Test identity verification requirement - unverified users cannot submit applications
     * Requirements: 8.1
     */
    public function test_unverified_user_cannot_submit_application()
    {
        $user = User::factory()->unverifiedPerson()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $this->actingAsUser($user);

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/submit");

        $response->assertStatus(403)
            ->assertJson(['message' => 'This action is unauthorized.']);
    }

    /**
     * Test identity verification requirement - verified users can submit applications
     * Requirements: 8.1
     */
    public function test_verified_user_can_submit_application()
    {
        // Fake events to prevent actual HTTP calls to Module 5
        \Illuminate\Support\Facades\Event::fake();
        
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        
        // Create a complete application with all required fields and jenis_lesen_id = 1
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->forCompany($company)
            ->withJenisLesen(1)
            ->draf()
            ->create([
                'butiran_operasi' => [
                    'alamat_premis' => [
                        'alamat_1' => 'Test Address',
                        'bandar' => 'Kuala Lumpur',
                        'poskod' => '50000',
                        'negeri' => 'Kuala Lumpur',
                    ],
                    'nama_perniagaan' => 'Test Business',
                ],
            ]);
        
        // Create required documents (jenis_lesen_id 1 requires documents 1, 2, 3)
        PermohonanDokumen::factory()->forPermohonan($permohonan)->uploadedBy($user)->create([
            'keperluan_dokumen_id' => 1,
        ]);
        PermohonanDokumen::factory()->forPermohonan($permohonan)->uploadedBy($user)->create([
            'keperluan_dokumen_id' => 2,
        ]);
        PermohonanDokumen::factory()->forPermohonan($permohonan)->uploadedBy($user)->create([
            'keperluan_dokumen_id' => 3,
        ]);
        
        $this->actingAsUser($user);

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/submit");

        $response->assertStatus(200);
    }

    /**
     * Test company ownership validation - cannot create application with unowned company
     * Requirements: 1.2
     */
    public function test_cannot_create_application_with_unowned_company()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $otherUser = User::factory()->verified()->pemohon()->create();
        $otherCompany = Company::factory()->active()->ownedBy($otherUser)->create();
        
        $this->actingAsUser($user);

        $response = $this->postJson('/api/m02/permohonan', [
            'company_id' => $otherCompany->id,
            'jenis_lesen_id' => 1,
            'butiran_operasi' => [
                'alamat_premis' => [
                    'alamat_1' => 'Test',
                    'bandar' => 'Test',
                    'poskod' => '50000',
                    'negeri' => 'Test',
                ],
                'nama_perniagaan' => 'Test',
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['company_id']);
    }

    /**
     * Test company ownership validation - cannot update application to unowned company
     * Requirements: 1.2
     */
    public function test_cannot_update_application_to_unowned_company()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $ownedCompany = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($ownedCompany)->draf()->create();
        
        $otherUser = User::factory()->verified()->pemohon()->create();
        $otherCompany = Company::factory()->active()->ownedBy($otherUser)->create();
        
        $this->actingAsUser($user);

        $response = $this->putJson("/api/m02/permohonan/{$permohonan->id}", [
            'company_id' => $otherCompany->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['company_id']);
    }

    /**
     * Test company ownership validation - can create application with owned company
     * Requirements: 1.2
     */
    public function test_can_create_application_with_owned_company()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        
        $this->actingAsUser($user);

        $response = $this->postJson('/api/m02/permohonan', [
            'company_id' => $company->id,
            'jenis_lesen_id' => 1,
            'butiran_operasi' => [
                'alamat_premis' => [
                    'alamat_1' => 'Test Address',
                    'bandar' => 'Kuala Lumpur',
                    'poskod' => '50000',
                    'negeri' => 'Kuala Lumpur',
                ],
                'nama_perniagaan' => 'Test Business',
            ],
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'permohonan' => [
                    'company_id' => $company->id,
                ],
            ]);
    }

    /**
     * Test company ownership validation - can update application with owned company
     * Requirements: 1.2
     */
    public function test_can_update_application_with_owned_company()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company1 = Company::factory()->active()->ownedBy($user)->create();
        $company2 = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company1)->draf()->create();
        
        $this->actingAsUser($user);

        $response = $this->putJson("/api/m02/permohonan/{$permohonan->id}", [
            'company_id' => $company2->id,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'permohonan' => [
                    'company_id' => $company2->id,
                ],
            ]);
    }
}
