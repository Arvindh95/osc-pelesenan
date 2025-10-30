<?php

namespace Tests\Unit\M02;

use App\Events\M02\DokumenDimuatNaik;
use App\Exceptions\M02\DokumenException;
use App\Models\Permohonan;
use App\Models\PermohonanDokumen;
use App\Models\User;
use App\Services\M02\DokumenService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DokumenServiceTest extends TestCase
{
    private DokumenService $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Enable M02 feature flag
        config(['features.MODULE_M02' => true]);
        
        // Set up fake storage
        Storage::fake('local');
        
        $this->service = app(DokumenService::class);
    }

    public function test_upload_creates_dokumen_with_correct_attributes()
    {
        Event::fake();
        
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        $file = UploadedFile::fake()->create('test-document.pdf', 1024);

        $dokumen = $this->service->upload($permohonan, 1, $file, $user);

        $this->assertInstanceOf(PermohonanDokumen::class, $dokumen);
        $this->assertEquals($permohonan->id, $dokumen->permohonan_id);
        $this->assertEquals(1, $dokumen->keperluan_dokumen_id);
        $this->assertEquals('test-document.pdf', $dokumen->nama_fail);
        $this->assertEquals('application/pdf', $dokumen->mime);
        $this->assertEquals('BelumSah', $dokumen->status_sah);
        $this->assertEquals($user->id, $dokumen->uploaded_by);
        $this->assertNotNull($dokumen->url_storan);
    }

    public function test_upload_stores_file_to_storage()
    {
        Event::fake();
        
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        $file = UploadedFile::fake()->create('test-document.pdf', 1024);

        $dokumen = $this->service->upload($permohonan, 1, $file, $user);

        Storage::disk('local')->assertExists($dokumen->url_storan);
    }

    public function test_upload_throws_exception_for_invalid_file_type()
    {
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        $file = UploadedFile::fake()->create('test-document.exe', 1024);

        $this->expectException(DokumenException::class);
        $this->service->upload($permohonan, 1, $file, $user);
    }

    public function test_upload_throws_exception_for_file_size_exceeded()
    {
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        // Set max upload size to 1MB
        config(['m02.files.max_upload_size' => 1024 * 1024]);

        // Create a file larger than 1MB
        $file = UploadedFile::fake()->create('large-document.pdf', 2048);

        $this->expectException(DokumenException::class);
        $this->service->upload($permohonan, 1, $file, $user);
    }

    public function test_upload_replaces_existing_document_for_same_keperluan()
    {
        Event::fake();
        
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        // Upload first document
        $file1 = UploadedFile::fake()->create('document-v1.pdf', 1024);
        $dokumen1 = $this->service->upload($permohonan, 1, $file1, $user);
        $oldPath = $dokumen1->url_storan;

        // Upload second document for same keperluan_dokumen_id
        $file2 = UploadedFile::fake()->create('document-v2.pdf', 1024);
        $dokumen2 = $this->service->upload($permohonan, 1, $file2, $user);

        // Old document should be deleted
        $this->assertDatabaseMissing('permohonan_dokumen', [
            'id' => $dokumen1->id,
        ]);

        // Old file should be deleted from storage
        Storage::disk('local')->assertMissing($oldPath);

        // New document should exist
        $this->assertDatabaseHas('permohonan_dokumen', [
            'id' => $dokumen2->id,
            'permohonan_id' => $permohonan->id,
            'keperluan_dokumen_id' => 1,
            'nama_fail' => 'document-v2.pdf',
        ]);
    }

    public function test_upload_computes_hash_when_enabled()
    {
        Event::fake();
        
        config(['m02.files.integrity_hash_enabled' => true]);

        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        $file = UploadedFile::fake()->create('test-document.pdf', 1024);

        $dokumen = $this->service->upload($permohonan, 1, $file, $user);

        $this->assertNotNull($dokumen->hash_fail);
        $this->assertEquals(64, strlen($dokumen->hash_fail)); // SHA-256 produces 64 hex characters
    }

    public function test_upload_does_not_compute_hash_when_disabled()
    {
        Event::fake();
        
        config(['m02.files.integrity_hash_enabled' => false]);

        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        $file = UploadedFile::fake()->create('test-document.pdf', 1024);

        $dokumen = $this->service->upload($permohonan, 1, $file, $user);

        $this->assertNull($dokumen->hash_fail);
    }

    public function test_upload_emits_event()
    {
        Event::fake();
        
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        $file = UploadedFile::fake()->create('test-document.pdf', 1024);

        $this->service->upload($permohonan, 1, $file, $user);

        Event::assertDispatched(DokumenDimuatNaik::class);
    }

    public function test_upload_creates_audit_log()
    {
        Event::fake();
        
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        $file = UploadedFile::fake()->create('test-document.pdf', 1024);

        $dokumen = $this->service->upload($permohonan, 1, $file, $user);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'dokumen_uploaded',
            'entity_type' => PermohonanDokumen::class,
            'entity_id' => $dokumen->id,
        ]);
    }

    public function test_upload_accepts_pdf_files()
    {
        Event::fake();
        
        $user = $this->createUser();
        $permohonan = Permohonan::factory()->forUser($user)->draf()->create();

        $file = UploadedFile::fake()->create('document.pdf', 1024);
        $dokumen = $this->service->upload($permohonan, 1, $file, $user);

        $this->assertNotNull($dokumen);
    }

    public function test_upload_accepts_jpg_files()
    {
        Event::fake();
        
        $user = $this->createUser();
        $permohonan = Permohonan::factory()->forUser($user)->draf()->create();

        $file = UploadedFile::fake()->create('photo.jpg', 1024, 'image/jpeg');
        $dokumen = $this->service->upload($permohonan, 1, $file, $user);

        $this->assertNotNull($dokumen);
        $this->assertEquals('photo.jpg', $dokumen->nama_fail);
    }

    public function test_upload_accepts_jpeg_files()
    {
        Event::fake();
        
        $user = $this->createUser();
        $permohonan = Permohonan::factory()->forUser($user)->draf()->create();

        $file = UploadedFile::fake()->create('photo.jpeg', 1024, 'image/jpeg');
        $dokumen = $this->service->upload($permohonan, 1, $file, $user);

        $this->assertNotNull($dokumen);
        $this->assertEquals('photo.jpeg', $dokumen->nama_fail);
    }

    public function test_upload_accepts_png_files()
    {
        Event::fake();
        
        $user = $this->createUser();
        $permohonan = Permohonan::factory()->forUser($user)->draf()->create();

        $file = UploadedFile::fake()->create('photo.png', 1024, 'image/png');
        $dokumen = $this->service->upload($permohonan, 1, $file, $user);

        $this->assertNotNull($dokumen);
        $this->assertEquals('photo.png', $dokumen->nama_fail);
    }

    public function test_delete_removes_dokumen_and_file()
    {
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        $dokumen = PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create();

        // Create a fake file in storage
        Storage::disk('local')->put($dokumen->url_storan, 'fake content');

        $this->service->delete($dokumen, $user);

        // Document should be deleted from database
        $this->assertDatabaseMissing('permohonan_dokumen', [
            'id' => $dokumen->id,
        ]);

        // File should be deleted from storage
        Storage::disk('local')->assertMissing($dokumen->url_storan);
    }

    public function test_delete_throws_exception_when_permohonan_not_draft()
    {
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->diserahkan()
            ->create();

        $dokumen = PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create();

        $this->expectException(DokumenException::class);
        $this->service->delete($dokumen, $user);
    }

    public function test_delete_throws_exception_when_document_validated()
    {
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        $dokumen = PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->disahkan()
            ->create();

        $this->expectException(DokumenException::class);
        $this->service->delete($dokumen, $user);
    }

    public function test_delete_creates_audit_log()
    {
        $user = $this->createUser();
        $permohonan = Permohonan::factory()
            ->forUser($user)
            ->draf()
            ->create();

        $dokumen = PermohonanDokumen::factory()
            ->forPermohonan($permohonan)
            ->create();

        // Create a fake file in storage
        Storage::disk('local')->put($dokumen->url_storan, 'fake content');

        $dokumenId = $dokumen->id;
        $this->service->delete($dokumen, $user);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'dokumen_deleted',
            'entity_type' => PermohonanDokumen::class,
            'entity_id' => $dokumenId,
        ]);
    }
}
