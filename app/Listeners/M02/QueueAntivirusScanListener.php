<?php

namespace App\Listeners\M02;

use App\Events\M02\DokumenDimuatNaik;
use App\Jobs\M02\ScanDokumenJob;
use App\Services\AuditService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class QueueAntivirusScanListener implements ShouldQueue
{
    use InteractsWithQueue;

    public $tries = 3;
    public $backoff = [1, 5, 15]; // Exponential backoff in seconds

    public function __construct(
        private AuditService $auditService
    ) {}

    public function handle(DokumenDimuatNaik $event): void
    {
        $dokumen = $event->permohonanDokumen;
        
        // Check if AV scanning is enabled
        if (!config('m02.antivirus.enabled', false)) {
            Log::info('AV scanning is disabled, skipping scan', [
                'dokumen_id' => $dokumen->id,
            ]);
            return;
        }

        try {
            $queue = config('m02.antivirus.queue', 'av-scans');
            
            // Queue the AV scan job (timeout is configured on the job itself)
            ScanDokumenJob::dispatch($dokumen)
                ->onQueue($queue);

            // Log success
            $this->auditService->log(
                action: 'queue_av_scan',
                entityType: 'permohonan_dokumen',
                entityId: 0, // UUID stored in meta
                meta: [
                    'dokumen_id' => $dokumen->id,
                    'status' => 'queued',
                    'queue' => $queue,
                    'permohonan_id' => $dokumen->permohonan_id,
                ]
            );

        } catch (\Exception $e) {
            // Log failure
            $this->auditService->log(
                action: 'queue_av_scan_failed',
                entityType: 'permohonan_dokumen',
                entityId: 0, // UUID stored in meta
                meta: [
                    'dokumen_id' => $dokumen->id,
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                    'attempt' => $this->attempts(),
                ]
            );

            Log::error('Failed to queue AV scan', [
                'dokumen_id' => $dokumen->id,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            // Re-throw to trigger retry
            throw $e;
        }
    }
}
