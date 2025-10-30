<?php

namespace Tests\Feature\M02;

use App\Events\M02\DokumenDimuatNaik;
use App\Models\AuditLog;
use App\Models\Company;
use App\Models\Permohonan;
use App\Models\PermohonanDokumen;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DokumenUploadTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Enable MODULE_M02 feature flag
        config(['features.MODULE_M02' => true]);
        
        // Set up fake storage for testing
        Storage::fake('local');
    }

    /**
     * Test POST /api/m02/permohonan/{id}/dokumen uploads document
     * Test file type validation (PDF, JPG, JPEG, PNG)
     * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.10
     */
    public function test_upload_pdf_document_successfully()
    {
        Event::fake();
        
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $this->actingAsUser($user);

        $file = UploadedFile::fake()->create('test-document.pdf', 1024, 'application/pdf');

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 1,
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'dokumen' => [
                    'id',
                    'permohonan_id',
                    'keperluan_dokumen_id',
                    'nama_fail',
                    'mime',
                    'saiz_bait',
                    'url_storan',
                    'status_sah',
                    'uploaded_by',
                ],
            ])
            ->assertJson([
                'dokumen' => [
                    'permohonan_id' => $permohonan->id,
                    'keperluan_dokumen_id' => 1,
                    'nama_fail' => 'test-document.pdf',
                    'mime' => 'application/pdf',
                    'status_sah' => 'BelumSah',
                    'uploaded_by' => $user->id,
                ],
            ]);

        // Verify database record
        $this->assertDatabaseHas('permohonan_dokumen', [
            'permohonan_id' => $permohonan->id,
            'keperluan_dokumen_id' => 1,
            'nama_fail' => 'test-document.pdf',
            'mime' => 'application/pdf',
            'status_sah' => 'BelumSah',
            'uploaded_by' => $user->id,
        ]);

        // Verify file stored
        $dokumen = PermohonanDokumen::where('permohonan_id', $permohonan->id)->first();
        Storage::disk('local')->assertExists($dokumen->url_storan);

        // Verify event emitted
        Event::assertDispatched(DokumenDimuatNaik::class);

        // Verify audit log
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'dokumen_uploaded',
            'entity_type' => 'App\\Models\\PermohonanDokumen',
        ]);
    }

    /**
     * Test uploading JPG document
     * Requirements: 3.1
     */
    public function test_upload_jpg_document_successfully()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $this->actingAsUser($user);

        $file = UploadedFile::fake()->create('photo.jpg', 1024, 'image/jpeg');

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 2,
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'dokumen' => [
                    'nama_fail' => 'photo.jpg',
                    'mime' => 'image/jpeg',
                ],
            ]);
    }

    /**
     * Test uploading PNG document
     * Requirements: 3.1
     */
    public function test_upload_png_document_successfully()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $this->actingAsUser($user);

        $file = UploadedFile::fake()->create('photo.png', 1024, 'image/png');

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 3,
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'dokumen' => [
                    'nama_fail' => 'photo.png',
                    'mime' => 'image/png',
                ],
            ]);
    }

    /**
     * Test file type validation rejects invalid types
     * Requirements: 3.1, 3.2
     */
    public function test_upload_invalid_file_type_rejected()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $this->actingAsUser($user);

        // Try to upload a .txt file
        $file = UploadedFile::fake()->create('document.txt', 100, 'text/plain');

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 1,
            'file' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    /**
     * Test file size validation
     * Requirements: 3.2, 3.3
     */
    public function test_upload_file_size_exceeds_limit_rejected()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $this->actingAsUser($user);

        // Create a file larger than 10MB (default max)
        $file = UploadedFile::fake()->create('large-document.pdf', 11 * 1024, 'application/pdf');

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 1,
            'file' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    /**
     * Test document metadata stored correctly
     * Requirements: 3.4, 3.5
     */
    public function test_document_metadata_stored_correctly()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $this->actingAsUser($user);

        $file = UploadedFile::fake()->create('metadata-test.pdf', 2048, 'application/pdf');

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 1,
            'file' => $file,
        ]);

        $response->assertStatus(201);

        $dokumen = PermohonanDokumen::where('permohonan_id', $permohonan->id)->first();
        
        $this->assertEquals('metadata-test.pdf', $dokumen->nama_fail);
        $this->assertEquals('application/pdf', $dokumen->mime);
        $this->assertGreaterThan(0, $dokumen->saiz_bait);
        $this->assertNotNull($dokumen->url_storan);
        $this->assertEquals($user->id, $dokumen->uploaded_by);
    }

    /**
     * Test status_sah is 'BelumSah' after upload
     * Requirements: 3.6
     */
    public function test_document_status_sah_is_belum_sah()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $this->actingAsUser($user);

        $file = UploadedFile::fake()->create('test.pdf', 1024, 'application/pdf');

        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 1,
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'dokumen' => [
                    'status_sah' => 'BelumSah',
                ],
            ]);
    }

    /**
     * Test document replacement when uploading to same keperluan_dokumen_id
     * Requirements: 3.6
     */
    public function test_document_replacement_when_uploading_to_same_keperluan()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $this->actingAsUser($user);

        // Upload first document
        $file1 = UploadedFile::fake()->create('first-document.pdf', 1024, 'application/pdf');
        $response1 = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 1,
            'file' => $file1,
        ]);
        $response1->assertStatus(201);
        
        $firstDokumenId = $response1->json('dokumen.id');
        $firstDokumenPath = $response1->json('dokumen.url_storan');

        // Upload second document with same keperluan_dokumen_id
        $file2 = UploadedFile::fake()->create('second-document.pdf', 2048, 'application/pdf');
        $response2 = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 1,
            'file' => $file2,
        ]);
        $response2->assertStatus(201);

        // Verify old document is deleted from database
        $this->assertDatabaseMissing('permohonan_dokumen', [
            'id' => $firstDokumenId,
        ]);

        // Verify old file is deleted from storage
        Storage::disk('local')->assertMissing($firstDokumenPath);

        // Verify new document exists
        $this->assertDatabaseHas('permohonan_dokumen', [
            'permohonan_id' => $permohonan->id,
            'keperluan_dokumen_id' => 1,
            'nama_fail' => 'second-document.pdf',
        ]);

        // Verify only one document exists for this keperluan_dokumen_id
        $count = PermohonanDokumen::where('permohonan_id', $permohonan->id)
            ->where('keperluan_dokumen_id', 1)
            ->count();
        $this->assertEquals(1, $count);
    }

    /**
     * Test DELETE /api/m02/permohonan/{id}/dokumen/{dokumenId} deletes document
     * Requirements: 6.1
     */
    public function test_delete_document_successfully()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        // Create a document
        $dokumen = PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->uploadedBy($user)
            ->create([
                'keperluan_dokumen_id' => 1,
                'url_storan' => 'test-path/document.pdf',
            ]);
        
        // Create the file in fake storage
        Storage::disk('local')->put($dokumen->url_storan, 'test content');
        
        $this->actingAsUser($user);

        $response = $this->deleteJson("/api/m02/permohonan/{$permohonan->id}/dokumen/{$dokumen->id}");

        $response->assertStatus(204);

        // Verify document deleted from database
        $this->assertDatabaseMissing('permohonan_dokumen', [
            'id' => $dokumen->id,
        ]);

        // Verify file deleted from storage
        Storage::disk('local')->assertMissing($dokumen->url_storan);

        // Verify audit log
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'dokumen_deleted',
            'entity_type' => 'App\\Models\\PermohonanDokumen',
            'entity_id' => $dokumen->id,
        ]);
    }

    /**
     * Test cannot delete document from submitted application
     * Requirements: 6.1
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
     * Test cannot delete validated documents
     * Requirements: 6.1
     */
    public function test_cannot_delete_validated_document()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $dokumen = PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->uploadedBy($user)
            ->disahkan()
            ->create();
        
        $this->actingAsUser($user);

        $response = $this->deleteJson("/api/m02/permohonan/{$permohonan->id}/dokumen/{$dokumen->id}");

        // Controller catches DokumenException and returns 500 with error message
        $response->assertStatus(500)
            ->assertJson([
                'message' => 'Failed to delete document.',
                'error' => 'Cannot delete a validated document.',
            ]);

        // Verify document still exists
        $this->assertDatabaseHas('permohonan_dokumen', [
            'id' => $dokumen->id,
        ]);
    }

    /**
     * Test cannot upload document to other user's application
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
     * Test cannot delete other user's document
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
     * Test cannot upload document to submitted application
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
     * Test validation errors for document upload
     */
    public function test_document_upload_validation_errors()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        $permohonan = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $this->actingAsUser($user);

        // Test missing keperluan_dokumen_id
        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'file' => UploadedFile::fake()->create('test.pdf', 1024, 'application/pdf'),
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['keperluan_dokumen_id']);

        // Test missing file
        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", [
            'keperluan_dokumen_id' => 1,
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    /**
     * Test authentication required for document endpoints
     */
    public function test_authentication_required_for_document_endpoints()
    {
        $permohonan = Permohonan::factory()->create();
        $dokumen = PermohonanDokumen::factory()->forPermohonan($permohonan)->create();

        // Test upload without auth
        $response = $this->postJson("/api/m02/permohonan/{$permohonan->id}/dokumen", []);
        $response->assertStatus(401);

        // Test delete without auth
        $response = $this->deleteJson("/api/m02/permohonan/{$permohonan->id}/dokumen/{$dokumen->id}");
        $response->assertStatus(401);
    }

    /**
     * Test document belongs to permohonan validation
     */
    public function test_cannot_delete_document_from_different_permohonan()
    {
        $user = User::factory()->verified()->pemohon()->create();
        $company = Company::factory()->active()->ownedBy($user)->create();
        
        $permohonan1 = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        $permohonan2 = Permohonan::factory()->forUser($user)->forCompany($company)->draf()->create();
        
        $dokumen = PermohonanDokumen::factory()
            ->forPermohonan($permohonan2)
            ->uploadedBy($user)
            ->create();
        
        $this->actingAsUser($user);

        // Try to delete dokumen from permohonan2 using permohonan1's endpoint
        $response = $this->deleteJson("/api/m02/permohonan/{$permohonan1->id}/dokumen/{$dokumen->id}");

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Document does not belong to this application.',
            ]);
    }
}
