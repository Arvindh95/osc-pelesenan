<?php

namespace Tests\Unit\M02;

use App\Events\M02\PermohonanDiserahkan;
use App\Exceptions\M02\PermohonanException;
use App\Models\Company;
use App\Models\Permohonan;
use App\Models\PermohonanDokumen;
use App\Models\User;
use App\Services\M02\Module4Client;
use App\Services\M02\PermohonanService;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class PermohonanServiceTest extends TestCase
{
    private PermohonanService $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Enable M02 feature flag
        config(['features.MODULE_M02' => true]);
        
        $this->service = app(PermohonanService::class);
    }

    public function test_create_draft_creates_permohonan_with_correct_attributes()
    {
        $user = $this->createUser();
        $company = $this->createCompany(['owner_user_id' => $user->id]);

        $data = [
            'company_id' => $company->id,
            'jenis_lesen_id' => 1,
            'butiran_operasi' => [
                'alamat_premis' => [
                    'alamat_1' => '123 Test Street',
                    'bandar' => 'Kuala Lumpur',
                    'poskod' => '50000',
                    'negeri' => 'Kuala Lumpur',
                ],
                'nama_perniagaan' => 'Test Business',
            ],
        ];

        $permohonan = $this->service->createDraft($user, $data);

        $this->assertInstanceOf(Permohonan::class, $permohonan);
        $this->assertEquals($user->id, $permohonan->user_id);
        $this->assertEquals($company->id, $permohonan->company_id);
        $this->assertEquals(1, $permohonan->jenis_lesen_id);
        $this->assertEquals('Draf', $permohonan->status);
        $this->assertNull($permohonan->tarikh_serahan);
        $this->assertEquals($data['butiran_operasi'], $permohonan->butiran_operasi);
    }

    public function test_create_draft_throws_exception_when_company_not_owned()
    {
        $user = $this->createUser();
        $otherUser = $this->createUser();
        $company = $this->createCompany(['owner_user_id' => $otherUser->id]);

        $data = [
            'company_id' => $company->id,
            'jenis_lesen_id' => 1,
            'butiran_operasi' => [],
        ];

        $this->expectException(PermohonanException::class);
        $this->service->createDraft($user, $data);
    }

    public function test_create_draft_throws_exception_when_jenis_lesen_invalid()
    {
        $user = $this->createUser();
        $company = $this->createCompany(['owner_user_id' => $user->id]);

        $data = [
            'company_id' => $company->id,
            'jenis_lesen_id' => 999, // Invalid ID
            'butiran_operasi' => [],
        ];

        $this->expectException(PermohonanException::class);
        $this->service->createDraft($user, $data);
    }

    public function test_create_draft_creates_audit_log()
    {
        $user = $this->createUser();
        $company = $this->createCompany(['owner_user_id' => $user->id]);

        $data = [
            'company_id' => $company->id,
            'jenis_lesen_id' => 1,
            'butiran_operasi' => [],
        ];

        $permohonan = $this->service->createDraft($user, $data);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'permohonan_created',
            'entity_type' => Permohonan::class,
            'entity_id' => $permohonan->id,
        ]);
    }

    public function test_update_draft_updates_permohonan_fields()
    {
        $user = $this->createUser();
        $company = $this->createCompany(['owner_user_id' => $user->id]);
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->forCompany($company)
            ->draf()
            ->create();

        $newData = [
            'jenis_lesen_id' => 2,
            'butiran_operasi' => [
                'alamat_premis' => [
                    'alamat_1' => 'Updated Address',
                    'bandar' => 'Penang',
                    'poskod' => '10000',
                    'negeri' => 'Penang',
                ],
            ],
        ];

        $updated = $this->service->updateDraft($permohonan, $user, $newData);

        $this->assertEquals(2, $updated->jenis_lesen_id);
        $this->assertEquals('Updated Address', $updated->butiran_operasi['alamat_premis']['alamat_1']);
    }

    public function test_update_draft_throws_exception_when_not_draft()
    {
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->diserahkan()
            ->create();

        $this->expectException(PermohonanException::class);
        $this->service->updateDraft($permohonan, $user, ['jenis_lesen_id' => 2]);
    }

    public function test_update_draft_validates_company_ownership_when_changing()
    {
        $user = $this->createUser();
        $otherUser = $this->createUser();
        $ownedCompany = $this->createCompany(['owner_user_id' => $user->id]);
        $otherCompany = $this->createCompany(['owner_user_id' => $otherUser->id]);
        
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->forCompany($ownedCompany)
            ->draf()
            ->create();

        $this->expectException(PermohonanException::class);
        $this->service->updateDraft($permohonan, $user, ['company_id' => $otherCompany->id]);
    }

    public function test_update_draft_creates_audit_log()
    {
        $user = $this->createUser();
        $company = $this->createCompany(['owner_user_id' => $user->id]);
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->forCompany($company)
            ->draf()
            ->create();

        $this->service->updateDraft($permohonan, $user, ['jenis_lesen_id' => 2]);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'permohonan_updated',
            'entity_type' => Permohonan::class,
            'entity_id' => $permohonan->id,
        ]);
    }

    public function test_validate_completeness_returns_errors_for_missing_fields()
    {
        $permohonan = Permohonan::factory()->create([
            'butiran_operasi' => null,
        ]);

        $errors = $this->service->validateCompleteness($permohonan);

        $this->assertNotEmpty($errors);
        $this->assertContains('Business operation details (butiran_operasi) are required', $errors);
    }

    public function test_validate_completeness_returns_errors_for_missing_alamat_premis()
    {
        $permohonan = Permohonan::factory()->create([
            'butiran_operasi' => [
                'nama_perniagaan' => 'Test Business',
            ],
        ]);

        $errors = $this->service->validateCompleteness($permohonan);

        $this->assertNotEmpty($errors);
        $this->assertContains('Premise address (alamat_premis) is required in business operation details', $errors);
    }

    public function test_validate_completeness_returns_errors_for_incomplete_address()
    {
        $permohonan = Permohonan::factory()->create([
            'butiran_operasi' => [
                'alamat_premis' => [
                    'alamat_1' => '123 Test Street',
                    // Missing bandar, poskod, negeri
                ],
            ],
        ]);

        $errors = $this->service->validateCompleteness($permohonan);

        $this->assertNotEmpty($errors);
        $this->assertContains('City (bandar) is required', $errors);
        $this->assertContains('Postal code (poskod) is required', $errors);
        $this->assertContains('State (negeri) is required', $errors);
    }

    public function test_validate_completeness_returns_errors_for_missing_documents()
    {
        $permohonan = Permohonan::factory()->create([
            'jenis_lesen_id' => 1,
            'butiran_operasi' => [
                'alamat_premis' => [
                    'alamat_1' => '123 Test Street',
                    'bandar' => 'Kuala Lumpur',
                    'poskod' => '50000',
                    'negeri' => 'Kuala Lumpur',
                ],
            ],
        ]);

        $errors = $this->service->validateCompleteness($permohonan);

        $this->assertNotEmpty($errors);
        // Should have errors about missing required documents
        $hasDocumentError = false;
        foreach ($errors as $error) {
            if (str_contains($error, 'Required document missing')) {
                $hasDocumentError = true;
                break;
            }
        }
        $this->assertTrue($hasDocumentError);
    }

    public function test_validate_completeness_returns_empty_for_complete_application()
    {
        $permohonan = Permohonan::factory()->create([
            'jenis_lesen_id' => 1,
            'butiran_operasi' => [
                'alamat_premis' => [
                    'alamat_1' => '123 Test Street',
                    'bandar' => 'Kuala Lumpur',
                    'poskod' => '50000',
                    'negeri' => 'Kuala Lumpur',
                ],
            ],
        ]);

        // Create all 3 required documents for jenis_lesen_id 1
        PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create(['keperluan_dokumen_id' => 1]);
        PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create(['keperluan_dokumen_id' => 2]);
        PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create(['keperluan_dokumen_id' => 3]);

        $errors = $this->service->validateCompleteness($permohonan);

        $this->assertEmpty($errors);
    }

    public function test_submit_changes_status_and_sets_tarikh_serahan()
    {
        Event::fake();
        
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create([
                'jenis_lesen_id' => 1,
                'butiran_operasi' => [
                    'alamat_premis' => [
                        'alamat_1' => '123 Test Street',
                        'bandar' => 'Kuala Lumpur',
                        'poskod' => '50000',
                        'negeri' => 'Kuala Lumpur',
                    ],
                ],
            ]);

        // Create all 3 required documents for jenis_lesen_id 1
        PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create(['keperluan_dokumen_id' => 1]);
        PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create(['keperluan_dokumen_id' => 2]);
        PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create(['keperluan_dokumen_id' => 3]);

        $submitted = $this->service->submit($permohonan, $user);

        $this->assertEquals('Diserahkan', $submitted->status);
        $this->assertNotNull($submitted->tarikh_serahan);
    }

    public function test_submit_throws_exception_when_incomplete()
    {
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create([
                'butiran_operasi' => null,
            ]);

        $this->expectException(PermohonanException::class);
        $this->service->submit($permohonan, $user);
    }

    public function test_submit_emits_event()
    {
        Event::fake();
        
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create([
                'jenis_lesen_id' => 1,
                'butiran_operasi' => [
                    'alamat_premis' => [
                        'alamat_1' => '123 Test Street',
                        'bandar' => 'Kuala Lumpur',
                        'poskod' => '50000',
                        'negeri' => 'Kuala Lumpur',
                    ],
                ],
            ]);

        // Create all 3 required documents for jenis_lesen_id 1
        PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create(['keperluan_dokumen_id' => 1]);
        PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create(['keperluan_dokumen_id' => 2]);
        PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create(['keperluan_dokumen_id' => 3]);

        $this->service->submit($permohonan, $user);

        Event::assertDispatched(PermohonanDiserahkan::class);
    }

    public function test_submit_creates_audit_log()
    {
        Event::fake();
        
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create([
                'jenis_lesen_id' => 1,
                'butiran_operasi' => [
                    'alamat_premis' => [
                        'alamat_1' => '123 Test Street',
                        'bandar' => 'Kuala Lumpur',
                        'poskod' => '50000',
                        'negeri' => 'Kuala Lumpur',
                    ],
                ],
            ]);

        // Create all 3 required documents for jenis_lesen_id 1
        PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create(['keperluan_dokumen_id' => 1]);
        PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create(['keperluan_dokumen_id' => 2]);
        PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create(['keperluan_dokumen_id' => 3]);

        $this->service->submit($permohonan, $user);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'permohonan_submitted',
            'entity_type' => Permohonan::class,
            'entity_id' => $permohonan->id,
        ]);
    }

    public function test_cancel_changes_status_to_dibatalkan()
    {
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        $cancelled = $this->service->cancel($permohonan, $user, 'No longer needed');

        $this->assertEquals('Dibatalkan', $cancelled->status);
    }

    public function test_cancel_throws_exception_when_not_draft()
    {
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->diserahkan()
            ->create();

        $this->expectException(PermohonanException::class);
        $this->service->cancel($permohonan, $user, 'Test reason');
    }

    public function test_cancel_creates_audit_log_with_reason()
    {
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        $reason = 'Changed my mind';
        $this->service->cancel($permohonan, $user, $reason);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'permohonan_cancelled',
            'entity_type' => Permohonan::class,
            'entity_id' => $permohonan->id,
        ]);
    }
}
