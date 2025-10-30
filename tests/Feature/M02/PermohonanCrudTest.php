<?php

namespace Tests\Feature\M02;

use App\Models\AuditLog;
use App\Models\Company;
use App\Models\Permohonan;
use App\Models\PermohonanDokumen;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class PermohonanCrudTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Enable MODULE_M02 feature flag
        config(['features.MODULE_M02' => true]);
    }

    /**
     * Test POST /api/m02/permohonan creates draft application
     * Requirements: 1.1, 1.2, 1.3, 1.4
     */
    public function test_create_draft_application_successfully()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        
        $this->actingAsUser($user);

        $applicationData = [
            'company_id' => $company->id,
            'jenis_lesen_id' => 1,
            'butiran_operasi' => [
                'alamat_premis' => [
                    'alamat_1' => '123 Jalan Test',
                    'alamat_2' => 'Taman Test',
                    'bandar' => 'Kuala Lumpur',
                    'poskod' => '50000',
                    'negeri' => 'Kuala Lumpur',
                ],
                'nama_perniagaan' => 'Test Business Sdn Bhd',
                'jenis_operasi' => 'Restoran',
                'bilangan_pekerja' => 10,
            ],
        ];

        $response = $this->postJson('/api/m02/permohonan', $applicationData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'permohonan' => [
                    'id',
                    'user_id',
                    'company_id',
                    'jenis_lesen_id',
                    'status',
                    'butiran_operasi',
                    'created_at',
                ],
            ])
            ->assertJson([
                'permohonan' => [
                    'user_id' => $user->id,
                    'company_id' => $company->id,
                    'status' => 'Draf',
                ],
            ]);

        // Verify database record
        $this->assertDatabaseHas('permohonan', [
            'user_id' => $user->id,
            'company_id' => $company->id,
            'jenis_lesen_id' => 1,
            'status' => 'Draf',
        ]);

        // Verify audit log
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'permohonan_created',
            'entity_type' => 'App\\Models\\Permohonan',
        ]);
    }

    /**
     * Test GET /api/m02/permohonan lists applications with filters
     * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
     */
    public function test_list_applications_with_filters()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $otherUser = User::factory()->verified()->pemohon()->create();
        
        // Create applications for the user
        $draftApp = Permohonan::factory()->forUser($user)->draf()->withJenisLesen(1)->create();
        $submittedApp = Permohonan::factory()->forUser($user)->diserahkan()->withJenisLesen(2)->create();
        $cancelledApp = Permohonan::factory()->forUser($user)->dibatalkan()->withJenisLesen(1)->create();
        
        // Create application for other user (should not appear)
        Permohonan::factory()->forUser($otherUser)->draf()->create();
        
        $this->actingAsUser($user);

        // Test: List all user's applications
        $response = $this->getJson('/api/m02/permohonan');
        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'user_id', 'company_id', 'jenis_lesen_id', 'status', 'created_at'],
                ],
                'current_page',
                'per_page',
                'total',
            ]);

        // Test: Filter by status
        $response = $this->getJson('/api/m02/permohonan?status=Draf');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJson([
                'data' => [
                    ['id' => $draftApp->id, 'status' => 'Draf'],
                ],
            ]);

        // Test: Filter by jenis_lesen_id
        $response = $this->getJson('/api/m02/permohonan?jenis_lesen_id=1');
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');

        // Test: Filter by date range
        $today = now()->format('Y-m-d');
        $response = $this->getJson("/api/m02/permohonan?tarikh_dari={$today}&tarikh_hingga={$today}");
        $response->assertStatus(200);

        // Test: Pagination
        $response = $this->getJson('/api/m02/permohonan?per_page=2');
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJson(['per_page' => 2]);

        // Test: Default sort by created_at DESC (newest first)
        $response = $this->getJson('/api/m02/permohonan');
        $data = $response->json('data');
        $this->assertTrue($data[0]['created_at'] >= $data[count($data) - 1]['created_at']);
    }

    /**
     * Test GET /api/m02/permohonan/{id} returns application details
     * Requirements: 11.1, 11.2, 11.3, 11.4
     */
    public function test_show_application_details()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        // Create documents for the application with different keperluan_dokumen_id
        PermohonanDokumen::factory()->forPermohonan($permohonan)->uploadedBy($user)->create([
            'keperluan_dokumen_id' => 1,
        ]);
        PermohonanDokumen::factory()->forPermohonan($permohonan)->uploadedBy($user)->create([
            'keperluan_dokumen_id' => 2,
        ]);
        
        $this->actingAsUser($user);

        $response = $this->getJson("/api/m02/permohonan/{$permohonan->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'permohonan' => [
                    'id',
                    'user_id',
                    'company_id',
                    'jenis_lesen_id',
                    'status',
                    'tarikh_serahan',
                    'butiran_operasi',
                    'created_at',
                    'updated_at',
                    'dokumen' => [
                        '*' => ['id', 'nama_fail', 'mime', 'saiz_bait', 'status_sah'],
                    ],
                    'company' => ['id', 'ssm_no', 'name', 'status'],
                ],
            ])
            ->assertJson([
                'permohonan' => [
                    'id' => $permohonan->id,
                    'user_id' => $user->id,
                    'company_id' => $company->id,
                ],
            ]);

        // Verify relationships are loaded
        $responseData = $response->json('permohonan');
        $this->assertCount(2, $responseData['dokumen']);
        $this->assertNotNull($responseData['company']);
    }

    /**
     * Test ownership enforcement for viewing applications
     * Requirements: 11.1
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
     * Test PUT /api/m02/permohonan/{id} updates draft application
     * Requirements: 6.1, 6.2, 6.3, 6.4
     */
    public function test_update_draft_application_successfully()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $this->actingAsUser($user);

        $updateData = [
            'jenis_lesen_id' => 2,
            'butiran_operasi' => [
                'alamat_premis' => [
                    'alamat_1' => 'Updated Address',
                    'bandar' => 'Petaling Jaya',
                    'poskod' => '46000',
                    'negeri' => 'Selangor',
                ],
                'nama_perniagaan' => 'Updated Business Name',
            ],
        ];

        $response = $this->putJson("/api/m02/permohonan/{$permohonan->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'permohonan' => [
                    'id' => $permohonan->id,
                    'jenis_lesen_id' => 2,
                ],
            ]);

        // Verify database update
        $permohonan->refresh();
        $this->assertEquals(2, $permohonan->jenis_lesen_id);
        $this->assertEquals('Updated Business Name', $permohonan->butiran_operasi['nama_perniagaan']);

        // Verify audit log
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'permohonan_updated',
            'entity_type' => 'App\\Models\\Permohonan',
            'entity_id' => $permohonan->id,
        ]);
    }

    /**
     * Test cannot update submitted application
     * Requirements: 6.1, 6.2
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
     * Test cannot update other user's application
     * Requirements: 6.3
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
     * Test POST /api/m02/permohonan/{id}/submit submits application
     * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3
     */
    public function test_submit_complete_application_successfully()
    {
        Event::fake();
        
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        // Create required documents (jenis_lesen_id 1 requires 3 documents: IDs 1, 2, 3)
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

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Permohonan berjaya diserahkan',
            ]);

        // Verify status changed
        $permohonan->refresh();
        $this->assertEquals('Diserahkan', $permohonan->status);
        $this->assertNotNull($permohonan->tarikh_serahan);

        // Verify event emitted
        Event::assertDispatched(\App\Events\M02\PermohonanDiserahkan::class);

        // Verify audit log
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'permohonan_submitted',
            'entity_type' => 'App\\Models\\Permohonan',
            'entity_id' => $permohonan->id,
        ]);
    }

    /**
     * Test cannot submit incomplete application
     * Requirements: 7.4
     */
    public function test_cannot_submit_incomplete_application()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create([
            'butiran_operasi' => [], // Missing required fields
        ]);
        
        $this->actingAsUser($user);

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/submit");

        $response->assertStatus(422)
            ->assertJsonStructure([
                'error',
                'validation_errors',
            ]);

        // Verify status unchanged
        $permohonan->refresh();
        $this->assertEquals('Draf', $permohonan->status);
    }

    /**
     * Test unverified user cannot submit application
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
     * Test POST /api/m02/permohonan/{id}/cancel cancels draft application
     * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
     */
    public function test_cancel_draft_application_successfully()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $permohonan = Permohonan::factory()->forUser($user)->draf()->create();
        
        $this->actingAsUser($user);

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/cancel", [
            'reason' => 'No longer needed',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Permohonan berjaya dibatalkan',
            ]);

        // Verify status changed
        $permohonan->refresh();
        $this->assertEquals('Dibatalkan', $permohonan->status);

        // Verify record retained
        $this->assertDatabaseHas('permohonan', [
            'id' => $permohonan->id,
            'status' => 'Dibatalkan',
        ]);

        // Verify audit log with reason
        $auditLog = AuditLog::where('action', 'permohonan_cancelled')
            ->where('entity_id', $permohonan->id)
            ->latest()
            ->first();
        
        $this->assertNotNull($auditLog);
        $this->assertEquals('No longer needed', $auditLog->meta['reason']);
    }

    /**
     * Test cannot cancel submitted application
     * Requirements: 9.1, 9.2
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
     * Test validation errors for creating application
     * Requirements: 1.2, 4.1, 4.2, 4.3, 4.4
     */
    public function test_create_application_validation_errors()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $this->actingAsUser($user);

        // Test missing required fields
        $response = $this->postJson('/api/m02/permohonan', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['company_id', 'jenis_lesen_id', 'butiran_operasi']);

        // Test invalid company_id (non-existent)
        $response = $this->postJson('/api/m02/permohonan', [
            'company_id' => 99999,
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

        // Test company not owned by user
        $otherUser = User::factory()->verified()->pemohon()->create();
        $otherCompany = Company::factory()->active()->ownedBy($otherUser)->create();
        
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
     * Test authentication required for all endpoints
     */
    public function test_authentication_required()
    {
        $permohonan = Permohonan::factory()->create();

        // Test create
        $response = $this->postJson('/api/m02/permohonan', []);
        $response->assertStatus(401);

        // Test list
        $response = $this->getJson('/api/m02/permohonan');
        $response->assertStatus(401);

        // Test show
        $response = $this->getJson("/api/m02/permohonan/{$permohonan->id}");
        $response->assertStatus(401);

        // Test update
        $response = $this->putJson("/api/m02/permohonan/{$permohonan->id}", []);
        $response->assertStatus(401);

        // Test submit
        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/submit");
        $response->assertStatus(401);

        // Test cancel
        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/cancel", []);
        $response->assertStatus(401);
    }
}
