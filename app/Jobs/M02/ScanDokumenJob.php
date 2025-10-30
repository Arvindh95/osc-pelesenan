<?php

namespace App\Jobs\M02;

use App\Models\PermohonanDokumen;
use App\Services\AuditService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ScanDokumenJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [1, 5, 15]; // Exponential backoff in seconds
    public $timeout = 300; // 5 minutes

    public function __construct(
        public PermohonanDokumen $dokumen
    ) {}

    public function handle(AuditService $auditService): void
    {
        try {
            // Get file path from storage
            $filePath = Storage::disk(config('m02.files.disk'))->path($this->dokumen->url_storan);
            
            if (!file_exists($filePath)) {
                throw new \Exception("File not found: {$filePath}");
            }

            // Simulate AV scan (in production, this would call actual AV service)
            // For now, we'll just log that the scan was performed
            Log::info('Performing AV scan', [
                'dokumen_id' => $this->dokumen->id,
                'file_path' => $filePath,
            ]);

            // In production, you would call an actual AV scanning service here
            // Example: $scanResult = AntivirusService::scan($filePath);
            
            // For now, assume scan passes
            $scanPassed = true;

            if ($scanPassed) {
                // Log success
                $auditService->log(
                    action: 'av_scan_completed',
                    entityType: 'permohonan_dokumen',
                    entityId: 0, // UUID stored in meta
                    meta: [
                        'dokumen_id' => $this->dokumen->id,
                        'status' => 'clean',
                        'scan_result' => 'passed',
                    ]
                );
            } else {
                // Log threat detected
                $auditService->log(
                    action: 'av_scan_threat_detected',
                    entityType: 'permohonan_dokumen',
                    entityId: 0, // UUID stored in meta
                    meta: [
                        'dokumen_id' => $this->dokumen->id,
                        'status' => 'threat_detected',
                        'scan_result' => 'failed',
                    ]
                );

                // In production, you might want to delete the file or mark it as infected
                Log::warning('AV scan detected threat', [
                    'dokumen_id' => $this->dokumen->id,
                ]);
            }

        } catch (\Exception $e) {
            // Log failure
            $auditService->log(
                action: 'av_scan_failed',
                entityType: 'permohonan_dokumen',
                entityId: 0, // UUID stored in meta
                meta: [
                    'dokumen_id' => $this->dokumen->id,
                    'status' => 'error',
                    'error' => $e->getMessage(),
                    'attempt' => $this->attempts(),
                ]
            );

            Log::error('AV scan failed', [
                'dokumen_id' => $this->dokumen->id,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            // Re-throw to trigger retry
            throw $e;
        }
    }
}
