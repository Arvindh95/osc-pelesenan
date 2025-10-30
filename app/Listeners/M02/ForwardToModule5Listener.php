<?php

namespace App\Listeners\M02;

use App\Events\M02\PermohonanDiserahkan;
use App\Services\AuditService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ForwardToModule5Listener implements ShouldQueue
{
    use InteractsWithQueue;

    public $tries = 3;
    public $backoff = [1, 5, 15]; // Exponential backoff in seconds

    public function __construct(
        private AuditService $auditService
    ) {}

    public function handle(PermohonanDiserahkan $event): void
    {
        $permohonan = $event->permohonan;
        
        try {
            $module5Url = config('m02.module5.base_url');
            
            if (!$module5Url) {
                throw new \Exception('Module 5 base URL not configured');
            }

            $response = Http::timeout(10)
                ->post("{$module5Url}/api/review-queue", [
                    'permohonan_id' => $permohonan->id,
                    'user_id' => $permohonan->user_id,
                    'company_id' => $permohonan->company_id,
                    'jenis_lesen_id' => $permohonan->jenis_lesen_id,
                    'tarikh_serahan' => $permohonan->tarikh_serahan?->toIso8601String(),
                    'butiran_operasi' => $permohonan->butiran_operasi,
                ]);

            if (!$response->successful()) {
                throw new \Exception("Module 5 returned status {$response->status()}");
            }

            // Log success
            $this->auditService->log(
                action: 'forward_to_module5',
                entityType: 'permohonan',
                entityId: 0, // UUID stored in meta
                meta: [
                    'permohonan_id' => $permohonan->id,
                    'status' => 'success',
                    'module5_response' => $response->json(),
                ]
            );

        } catch (\Exception $e) {
            // Log failure
            $this->auditService->log(
                action: 'forward_to_module5_failed',
                entityType: 'permohonan',
                entityId: 0, // UUID stored in meta
                meta: [
                    'permohonan_id' => $permohonan->id,
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                    'attempt' => $this->attempts(),
                ]
            );

            Log::error('Failed to forward application to Module 5', [
                'permohonan_id' => $permohonan->id,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            // Re-throw to trigger retry
            throw $e;
        }
    }
}
