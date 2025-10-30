<?php

namespace App\Services\M02;

use App\Events\M02\PermohonanDiserahkan;
use App\Exceptions\M02\PermohonanException;
use App\Models\Company;
use App\Models\Permohonan;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PermohonanService
{
    public function __construct(
        private AuditService $auditService,
        private Module4Client $module4Client
    ) {}

    /**
     * Create a new draft application.
     *
     * @param User $user The authenticated user creating the application
     * @param array $data Application data including company_id, jenis_lesen_id, butiran_operasi
     * @return Permohonan
     * @throws PermohonanException
     */
    public function createDraft(User $user, array $data): Permohonan
    {
        // Validate company_id belongs to authenticated user
        $company = Company::find($data['company_id']);
        
        if (!$company || $company->owner_user_id !== $user->id) {
            throw PermohonanException::companyNotOwned();
        }

        // Validate jenis_lesen_id exists via Module4Client
        if (!$this->module4Client->jenisLesenExists($data['jenis_lesen_id'])) {
            throw PermohonanException::invalidJenisLesen($data['jenis_lesen_id']);
        }

        // Create permohonan with pre-populated user_id and company_id
        $permohonan = DB::transaction(function () use ($user, $data) {
            $permohonan = Permohonan::create([
                'user_id' => $user->id,
                'company_id' => $data['company_id'],
                'jenis_lesen_id' => $data['jenis_lesen_id'],
                'status' => 'Draf',
                'butiran_operasi' => $data['butiran_operasi'] ?? null,
            ]);

            // Log creation via AuditService
            $this->auditService->logUserAction(
                $user,
                'permohonan_created',
                $permohonan,
                [
                    'jenis_lesen_id' => $data['jenis_lesen_id'],
                    'company_id' => $data['company_id'],
                ]
            );

            return $permohonan;
        });

        Log::info('Draft application created', [
            'permohonan_id' => $permohonan->id,
            'user_id' => $user->id,
            'company_id' => $data['company_id'],
            'jenis_lesen_id' => $data['jenis_lesen_id'],
        ]);

        return $permohonan;
    }

    /**
     * Update a draft application.
     *
     * @param Permohonan $permohonan The application to update
     * @param User $user The authenticated user updating the application
     * @param array $data Updated application data
     * @return Permohonan
     * @throws PermohonanException
     */
    public function updateDraft(Permohonan $permohonan, User $user, array $data): Permohonan
    {
        // Validate permohonan status is 'Draf'
        if (!$permohonan->isDraf()) {
            throw PermohonanException::notDraft();
        }

        // If company_id is being changed, validate it belongs to user
        if (isset($data['company_id']) && $data['company_id'] !== $permohonan->company_id) {
            $company = Company::find($data['company_id']);
            
            if (!$company || $company->owner_user_id !== $user->id) {
                throw PermohonanException::companyNotOwned();
            }
        }

        // If jenis_lesen_id is being changed, validate it exists via Module4Client
        if (isset($data['jenis_lesen_id']) && $data['jenis_lesen_id'] !== $permohonan->jenis_lesen_id) {
            if (!$this->module4Client->jenisLesenExists($data['jenis_lesen_id'])) {
                throw PermohonanException::invalidJenisLesen($data['jenis_lesen_id']);
            }
        }

        // Update permohonan fields
        DB::transaction(function () use ($permohonan, $user, $data) {
            $originalData = $permohonan->only(['company_id', 'jenis_lesen_id', 'butiran_operasi']);
            
            $permohonan->update(array_filter([
                'company_id' => $data['company_id'] ?? null,
                'jenis_lesen_id' => $data['jenis_lesen_id'] ?? null,
                'butiran_operasi' => $data['butiran_operasi'] ?? null,
            ], fn($value) => $value !== null));

            // Log update via AuditService
            $this->auditService->logUserAction(
                $user,
                'permohonan_updated',
                $permohonan,
                [
                    'original' => $originalData,
                    'updated' => $permohonan->only(['company_id', 'jenis_lesen_id', 'butiran_operasi']),
                ]
            );
        });

        Log::info('Draft application updated', [
            'permohonan_id' => $permohonan->id,
            'user_id' => $user->id,
        ]);

        return $permohonan->fresh();
    }

    /**
     * Validate if an application is complete and ready for submission.
     *
     * @param Permohonan $permohonan The application to validate
     * @return array Array of validation errors (empty if complete)
     */
    public function validateCompleteness(Permohonan $permohonan): array
    {
        $errors = [];

        // Check all mandatory fields are present
        if (empty($permohonan->user_id)) {
            $errors[] = 'User ID is required';
        }

        if (empty($permohonan->company_id)) {
            $errors[] = 'Company ID is required';
        }

        if (empty($permohonan->jenis_lesen_id)) {
            $errors[] = 'License type (jenis_lesen_id) is required';
        }

        // Validate butiran_operasi.alamat_premis exists and is non-empty
        if (empty($permohonan->butiran_operasi)) {
            $errors[] = 'Business operation details (butiran_operasi) are required';
        } else {
            $butiranOperasi = $permohonan->butiran_operasi;
            
            if (empty($butiranOperasi['alamat_premis'])) {
                $errors[] = 'Premise address (alamat_premis) is required in business operation details';
            } else {
                $alamatPremis = $butiranOperasi['alamat_premis'];
                
                // Check required address fields
                if (empty($alamatPremis['alamat_1'])) {
                    $errors[] = 'Address line 1 (alamat_1) is required';
                }
                if (empty($alamatPremis['bandar'])) {
                    $errors[] = 'City (bandar) is required';
                }
                if (empty($alamatPremis['poskod'])) {
                    $errors[] = 'Postal code (poskod) is required';
                }
                if (empty($alamatPremis['negeri'])) {
                    $errors[] = 'State (negeri) is required';
                }
            }
        }

        // Fetch keperluan_dokumen from Module4Client (cached)
        try {
            $keperluanDokumen = $this->module4Client->getKeperluanDokumen($permohonan->jenis_lesen_id);
            
            // Get uploaded document keperluan_dokumen_ids
            $uploadedDokumenIds = $permohonan->dokumen()
                ->pluck('keperluan_dokumen_id')
                ->toArray();

            // Verify all required documents are uploaded
            $requiredDokumen = $keperluanDokumen->where('wajib', true);
            
            foreach ($requiredDokumen as $dokumen) {
                if (!in_array($dokumen['id'], $uploadedDokumenIds)) {
                    $errors[] = "Required document missing: {$dokumen['nama']} (ID: {$dokumen['id']})";
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to validate document completeness', [
                'permohonan_id' => $permohonan->id,
                'error' => $e->getMessage(),
            ]);
            $errors[] = 'Unable to verify document requirements. Please try again later.';
        }

        return $errors;
    }

    /**
     * Submit an application to PBT for review.
     *
     * @param Permohonan $permohonan The application to submit
     * @param User $user The authenticated user submitting the application
     * @return Permohonan
     * @throws PermohonanException
     */
    public function submit(Permohonan $permohonan, User $user): Permohonan
    {
        // Call validateCompleteness() and throw exception if incomplete
        $validationErrors = $this->validateCompleteness($permohonan);
        
        if (!empty($validationErrors)) {
            throw PermohonanException::incomplete($validationErrors);
        }

        // Change status from 'Draf' to 'Diserahkan' and set tarikh_serahan
        DB::transaction(function () use ($permohonan, $user) {
            $permohonan->update([
                'status' => 'Diserahkan',
                'tarikh_serahan' => now(),
            ]);

            // Log submission via AuditService
            $this->auditService->logUserAction(
                $user,
                'permohonan_submitted',
                $permohonan,
                [
                    'tarikh_serahan' => $permohonan->tarikh_serahan->toIso8601String(),
                ]
            );
        });

        // Emit PermohonanDiserahkan event
        event(new PermohonanDiserahkan($permohonan));

        Log::info('Application submitted', [
            'permohonan_id' => $permohonan->id,
            'user_id' => $user->id,
            'tarikh_serahan' => $permohonan->tarikh_serahan,
        ]);

        return $permohonan->fresh();
    }

    /**
     * Cancel a draft application.
     *
     * @param Permohonan $permohonan The application to cancel
     * @param User $user The authenticated user cancelling the application
     * @param string $reason The reason for cancellation
     * @return Permohonan
     * @throws PermohonanException
     */
    public function cancel(Permohonan $permohonan, User $user, string $reason): Permohonan
    {
        // Validate permohonan status is 'Draf'
        if (!$permohonan->isDraf()) {
            throw PermohonanException::notDraft();
        }

        // Change status to 'Dibatalkan'
        DB::transaction(function () use ($permohonan, $user, $reason) {
            $permohonan->update([
                'status' => 'Dibatalkan',
            ]);

            // Log cancellation via AuditService with reason
            $this->auditService->logUserAction(
                $user,
                'permohonan_cancelled',
                $permohonan,
                [
                    'reason' => $reason,
                ]
            );
        });

        Log::info('Application cancelled', [
            'permohonan_id' => $permohonan->id,
            'user_id' => $user->id,
            'reason' => $reason,
        ]);

        return $permohonan->fresh();
    }
}
