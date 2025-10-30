<?php

namespace App\Listeners\M02;

use App\Events\M02\PermohonanDiserahkan;
use App\Services\AuditService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendSubmissionNotificationListener implements ShouldQueue
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
            $module12Url = config('m02.module12.base_url');
            
            if (!$module12Url) {
                throw new \Exception('Module 12 base URL not configured');
            }

            $response = Http::timeout(10)
                ->post("{$module12Url}/api/notifications/send", [
                    'user_id' => $permohonan->user_id,
                    'notification_type' => 'permohonan_diserahkan',
                    'data' => [
                        'permohonan_id' => $permohonan->id,
                        'jenis_lesen_id' => $permohonan->jenis_lesen_id,
                        'tarikh_serahan' => $permohonan->tarikh_serahan?->toIso8601String(),
                    ],
                ]);

            if (!$response->successful()) {
                throw new \Exception("Module 12 returned status {$response->status()}");
            }

            // Log success
            $this->auditService->log(
                action: 'send_submission_notification',
                entityType: 'permohonan',
                entityId: 0, // UUID stored in meta
                meta: [
                    'permohonan_id' => $permohonan->id,
                    'status' => 'success',
                    'module12_response' => $response->json(),
                ]
            );

        } catch (\Exception $e) {
            // Log failure
            $this->auditService->log(
                action: 'send_submission_notification_failed',
                entityType: 'permohonan',
                entityId: 0, // UUID stored in meta
                meta: [
                    'permohonan_id' => $permohonan->id,
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                    'attempt' => $this->attempts(),
                ]
            );

            Log::error('Failed to send submission notification via Module 12', [
                'permohonan_id' => $permohonan->id,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            // Re-throw to trigger retry
            throw $e;
        }
    }
}
