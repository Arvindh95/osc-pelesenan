<?php

namespace App\Services\M02;

use App\Events\M02\DokumenDimuatNaik;
use App\Exceptions\M02\DokumenException;
use App\Models\Permohonan;
use App\Models\PermohonanDokumen;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DokumenService
{
    public function __construct(
        private AuditService $auditService
    ) {}

    /**
     * Upload a document for a license application.
     *
     * @param Permohonan $permohonan The application to upload document for
     * @param int $keperluanDokumenId The document requirement ID from Module 4
     * @param UploadedFile $file The uploaded file
     * @param User $uploader The user uploading the document
     * @return PermohonanDokumen
     * @throws DokumenException
     */
    public function upload(
        Permohonan $permohonan,
        int $keperluanDokumenId,
        UploadedFile $file,
        User $uploader
    ): PermohonanDokumen {
        // Validate file type
        $allowedMimes = config('m02.files.allowed_mimes', ['pdf', 'jpg', 'jpeg', 'png']);
        $fileExtension = strtolower($file->getClientOriginalExtension());
        
        if (!in_array($fileExtension, $allowedMimes)) {
            throw DokumenException::invalidFileType($fileExtension, $allowedMimes);
        }

        // Validate file size
        $maxUploadSize = config('m02.files.max_upload_size', 10 * 1024 * 1024);
        $fileSize = $file->getSize();
        
        if ($fileSize > $maxUploadSize) {
            throw DokumenException::fileSizeExceeded($fileSize, $maxUploadSize);
        }

        return DB::transaction(function () use ($permohonan, $keperluanDokumenId, $file, $uploader, $fileSize) {
            // Check if document already exists for this keperluan_dokumen_id
            $existingDokumen = PermohonanDokumen::where('permohonan_id', $permohonan->id)
                ->where('keperluan_dokumen_id', $keperluanDokumenId)
                ->first();

            // If exists, delete the old file from storage
            if ($existingDokumen) {
                Storage::disk(config('m02.files.disk', 'local'))
                    ->delete($existingDokumen->url_storan);
                
                // Delete the old record
                $existingDokumen->delete();
            }

            // Store file to configured filesystem disk
            $disk = config('m02.files.disk', 'local');
            $path = $file->store("permohonan/{$permohonan->id}/dokumen", $disk);

            // Compute SHA-256 hash if integrity hashing is enabled
            $hashFail = null;
            if (config('m02.files.integrity_hash_enabled', false)) {
                $hashFail = hash_file('sha256', $file->getRealPath());
            }

            // Create permohonan_dokumen record
            $permohonanDokumen = PermohonanDokumen::create([
                'permohonan_id' => $permohonan->id,
                'keperluan_dokumen_id' => $keperluanDokumenId,
                'nama_fail' => $file->getClientOriginalName(),
                'mime' => $file->getMimeType(),
                'saiz_bait' => $fileSize,
                'url_storan' => $path,
                'hash_fail' => $hashFail,
                'status_sah' => 'BelumSah',
                'uploaded_by' => $uploader->id,
            ]);

            // Log upload via AuditService
            $this->auditService->log(
                action: 'dokumen_uploaded',
                entityType: PermohonanDokumen::class,
                entityId: $permohonanDokumen->id,
                meta: [
                    'permohonan_id' => $permohonan->id,
                    'keperluan_dokumen_id' => $keperluanDokumenId,
                    'nama_fail' => $file->getClientOriginalName(),
                    'saiz_bait' => $fileSize,
                    'replaced_existing' => $existingDokumen !== null,
                ],
                actor: $uploader
            );

            // Emit DokumenDimuatNaik event
            event(new DokumenDimuatNaik($permohonanDokumen));

            return $permohonanDokumen;
        });
    }

    /**
     * Delete a document from a license application.
     *
     * @param PermohonanDokumen $dokumen The document to delete
     * @param User $actor The user deleting the document
     * @return void
     * @throws DokumenException
     */
    public function delete(PermohonanDokumen $dokumen, User $actor): void
    {
        // Load the permohonan relationship if not already loaded
        if (!$dokumen->relationLoaded('permohonan')) {
            $dokumen->load('permohonan');
        }

        // Validate permohonan status is 'Draf'
        if (!$dokumen->permohonan->isDraf()) {
            throw DokumenException::permohonanNotDraft();
        }

        // Validate document status_sah is 'BelumSah' (cannot delete validated documents)
        if ($dokumen->status_sah === 'Disahkan') {
            throw DokumenException::documentAlreadyValidated();
        }

        DB::transaction(function () use ($dokumen, $actor) {
            // Delete file from storage
            Storage::disk(config('m02.files.disk', 'local'))
                ->delete($dokumen->url_storan);

            // Log deletion via AuditService
            $this->auditService->log(
                action: 'dokumen_deleted',
                entityType: PermohonanDokumen::class,
                entityId: $dokumen->id,
                meta: [
                    'permohonan_id' => $dokumen->permohonan_id,
                    'keperluan_dokumen_id' => $dokumen->keperluan_dokumen_id,
                    'nama_fail' => $dokumen->nama_fail,
                ],
                actor: $actor
            );

            // Delete permohonan_dokumen record
            $dokumen->delete();
        });
    }
}
