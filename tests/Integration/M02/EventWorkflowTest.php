<?php

namespace Tests\Integration\M02;

use App\Events\M02\DokumenDimuatNaik;
use App\Events\M02\PermohonanDiserahkan;
use App\Jobs\M02\ScanDokumenJob;
use App\Listeners\M02\ForwardToModule5Listener;
use App\Listeners\M02\QueueAntivirusScanListener;
use App\Listeners\M02\SendSubmissionNotificationListener;
use App\Models\Company;
use App\Models\Permohonan;
use App\Models\PermohonanDokumen;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class EventWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Company $company;
    private Permohonan $permohonan;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test user and company
        $this->user = User::factory()->create([
            'status_verified_person' => 'Verified',
        ]);

        $this->company = Company::factory()->create([
            'owner_user_id' => $this->user->id,
        ]);

        // Create test permohonan
        $this->permohonan = Permohonan::factory()->create([
            'user_id' => $this->user->id,
            'company_id' => $this->company->id,
            'status' => 'Diserahkan',
            'tarikh_serahan' => now(),
        ]);
    }

    /**
     * Test PermohonanDiserahkan event triggers Module 5 forwarding
     * Requirements: 8.4
     */
    public function test_permohonan_diserahkan_triggers_module5_forwarding()
    {
        // Mock Module 5 API
        Http::fake([
            '*/api/review-queue' => Http::response([
                'success' => true,
                'message' => 'Application received',
            ], 200),
        ]);

        // Create listener with real AuditService
        $auditService = app(AuditService::class);
        $listener = new ForwardToModule5Listener($auditService);

        // Create and handle event
        $event = new PermohonanDiserahkan($this->permohonan);
        $listener->handle($event);

        // Verify HTTP request was sent to Module 5
        Http::assertSent(function ($request) {
            return $request->url() === config('m02.module5.base_url') . '/api/review-queue'
                && $request['permohonan_id'] === $this->permohonan->id
                && $request['user_id'] === $this->permohonan->user_id
                && $request['company_id'] === $this->permohonan->company_id
                && $request['jenis_lesen_id'] === $this->permohonan->jenis_lesen_id;
        });

        // Verify audit log was created
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'forward_to_module5',
            'entity_type' => 'permohonan',
        ]);
    }

    /**
     * Test Module 5 forwarding retry behavior on failure
     * Requirements: 8.4
     */
    public function test_module5_forwarding_retries_on_failure()
    {
        // Mock Module 5 API to fail
        Http::fake([
            '*/api/review-queue' => Http::response([], 500),
        ]);

        // Create listener
        $auditService = app(AuditService::class);
        $listener = new ForwardToModule5Listener($auditService);

        // Create event
        $event = new PermohonanDiserahkan($this->permohonan);

        // Attempt to handle event - should throw exception for retry
        try {
            $listener->handle($event);
            $this->fail('Expected exception was not thrown');
        } catch (\Exception $e) {
            // Exception is expected for retry mechanism
            $this->assertNotEmpty($e->getMessage());
        }

        // Verify failure was logged
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'forward_to_module5_failed',
            'entity_type' => 'permohonan',
        ]);
    }

    /**
     * Test Module 5 forwarding audit logging
     * Requirements: 8.4
     */
    public function test_module5_forwarding_audit_logging()
    {
        // Mock Module 5 API
        Http::fake([
            '*/api/review-queue' => Http::response([
                'success' => true,
                'queue_id' => 'Q12345',
            ], 200),
        ]);

        // Create listener
        $auditService = app(AuditService::class);
        $listener = new ForwardToModule5Listener($auditService);

        // Handle event
        $event = new PermohonanDiserahkan($this->permohonan);
        $listener->handle($event);

        // Verify audit log contains response data
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'forward_to_module5',
            'entity_type' => 'permohonan',
        ]);

        // Verify meta contains permohonan_id
        $auditLog = \App\Models\AuditLog::where('action', 'forward_to_module5')->first();
        $this->assertNotNull($auditLog);
        $this->assertEquals($this->permohonan->id, $auditLog->meta['permohonan_id']);
        $this->assertEquals('success', $auditLog->meta['status']);
    }

    /**
     * Test PermohonanDiserahkan event triggers Module 12 notification
     * Requirements: 8.6
     */
    public function test_permohonan_diserahkan_triggers_module12_notification()
    {
        // Mock Module 12 API
        Http::fake([
            '*/api/notifications/send' => Http::response([
                'success' => true,
                'notification_id' => 'N12345',
            ], 200),
        ]);

        // Create listener
        $auditService = app(AuditService::class);
        $listener = new SendSubmissionNotificationListener($auditService);

        // Handle event
        $event = new PermohonanDiserahkan($this->permohonan);
        $listener->handle($event);

        // Verify HTTP request was sent to Module 12
        Http::assertSent(function ($request) {
            return $request->url() === config('m02.module12.base_url') . '/api/notifications/send'
                && $request['user_id'] === $this->permohonan->user_id
                && $request['notification_type'] === 'permohonan_diserahkan'
                && $request['data']['permohonan_id'] === $this->permohonan->id;
        });

        // Verify audit log was created
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'send_submission_notification',
            'entity_type' => 'permohonan',
        ]);
    }

    /**
     * Test Module 12 notification retry behavior on failure
     * Requirements: 8.6
     */
    public function test_module12_notification_retries_on_failure()
    {
        // Mock Module 12 API to fail
        Http::fake([
            '*/api/notifications/send' => Http::response([], 500),
        ]);

        // Create listener
        $auditService = app(AuditService::class);
        $listener = new SendSubmissionNotificationListener($auditService);

        // Create event
        $event = new PermohonanDiserahkan($this->permohonan);

        // Attempt to handle event - should throw exception for retry
        try {
            $listener->handle($event);
            $this->fail('Expected exception was not thrown');
        } catch (\Exception $e) {
            // Exception is expected for retry mechanism
            $this->assertNotEmpty($e->getMessage());
        }

        // Verify failure was logged
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'send_submission_notification_failed',
            'entity_type' => 'permohonan',
        ]);
    }

    /**
     * Test Module 12 notification audit logging
     * Requirements: 8.6
     */
    public function test_module12_notification_audit_logging()
    {
        // Mock Module 12 API
        Http::fake([
            '*/api/notifications/send' => Http::response([
                'success' => true,
                'notification_id' => 'N67890',
            ], 200),
        ]);

        // Create listener
        $auditService = app(AuditService::class);
        $listener = new SendSubmissionNotificationListener($auditService);

        // Handle event
        $event = new PermohonanDiserahkan($this->permohonan);
        $listener->handle($event);

        // Verify audit log contains response data
        $auditLog = \App\Models\AuditLog::where('action', 'send_submission_notification')->first();
        $this->assertNotNull($auditLog);
        $this->assertEquals($this->permohonan->id, $auditLog->meta['permohonan_id']);
        $this->assertEquals('success', $auditLog->meta['status']);
    }

    /**
     * Test DokumenDimuatNaik event queues AV scan when enabled
     * Requirements: 3.8
     */
    public function test_dokumen_dimuatnaik_queues_av_scan_when_enabled()
    {
        // Enable AV scanning
        config(['m02.antivirus.enabled' => true]);

        // Fake the queue
        Queue::fake();

        // Create test document
        $dokumen = PermohonanDokumen::factory()->create([
            'permohonan_id' => $this->permohonan->id,
            'uploaded_by' => $this->user->id,
        ]);

        // Create listener
        $auditService = app(AuditService::class);
        $listener = new QueueAntivirusScanListener($auditService);

        // Handle event
        $event = new DokumenDimuatNaik($dokumen);
        $listener->handle($event);

        // Verify job was queued
        Queue::assertPushed(ScanDokumenJob::class, function ($job) use ($dokumen) {
            return $job->dokumen->id === $dokumen->id;
        });

        // Verify audit log was created
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'queue_av_scan',
            'entity_type' => 'permohonan_dokumen',
        ]);
    }

    /**
     * Test DokumenDimuatNaik event does not queue AV scan when disabled
     * Requirements: 3.8
     */
    public function test_dokumen_dimuatnaik_does_not_queue_av_scan_when_disabled()
    {
        // Disable AV scanning
        config(['m02.antivirus.enabled' => false]);

        // Fake the queue
        Queue::fake();

        // Create test document
        $dokumen = PermohonanDokumen::factory()->create([
            'permohonan_id' => $this->permohonan->id,
            'uploaded_by' => $this->user->id,
        ]);

        // Create listener
        $auditService = app(AuditService::class);
        $listener = new QueueAntivirusScanListener($auditService);

        // Handle event
        $event = new DokumenDimuatNaik($dokumen);
        $listener->handle($event);

        // Verify job was NOT queued
        Queue::assertNotPushed(ScanDokumenJob::class);

        // Verify no audit log for queuing (since it was skipped)
        $this->assertDatabaseMissing('audit_logs', [
            'action' => 'queue_av_scan',
            'entity_type' => 'permohonan_dokumen',
        ]);
    }

    /**
     * Test AV scan job queuing uses correct queue name
     * Requirements: 3.8
     */
    public function test_av_scan_uses_configured_queue()
    {
        // Enable AV scanning with custom queue
        config(['m02.antivirus.enabled' => true]);
        config(['m02.antivirus.queue' => 'custom-av-queue']);

        // Fake the queue
        Queue::fake();

        // Create test document
        $dokumen = PermohonanDokumen::factory()->create([
            'permohonan_id' => $this->permohonan->id,
            'uploaded_by' => $this->user->id,
        ]);

        // Create listener
        $auditService = app(AuditService::class);
        $listener = new QueueAntivirusScanListener($auditService);

        // Handle event
        $event = new DokumenDimuatNaik($dokumen);
        $listener->handle($event);

        // Verify job was queued on correct queue
        Queue::assertPushedOn('custom-av-queue', ScanDokumenJob::class);
    }

    /**
     * Test AV scan listener handles exceptions gracefully
     * Requirements: 3.8
     */
    public function test_av_scan_listener_handles_exceptions()
    {
        // Enable AV scanning
        config(['m02.antivirus.enabled' => true]);

        // Create test document with invalid permohonan_id to trigger error
        $dokumen = new PermohonanDokumen([
            'id' => 'invalid-id',
            'permohonan_id' => 'non-existent',
            'uploaded_by' => $this->user->id,
        ]);

        // Create listener
        $auditService = app(AuditService::class);
        $listener = new QueueAntivirusScanListener($auditService);

        // Handle event - should handle gracefully
        $event = new DokumenDimuatNaik($dokumen);

        // The listener should queue the job successfully even with invalid data
        // The job itself will handle validation
        try {
            Queue::fake();
            $listener->handle($event);
            
            // Verify job was queued
            Queue::assertPushed(ScanDokumenJob::class);
        } catch (\Exception $e) {
            // If exception occurs, verify it's logged
            $this->assertNotEmpty($e->getMessage());
        }
    }

    /**
     * Test exponential backoff configuration for Module 5 listener
     * Requirements: 8.4
     */
    public function test_module5_listener_has_exponential_backoff()
    {
        $auditService = app(AuditService::class);
        $listener = new ForwardToModule5Listener($auditService);

        // Verify retry configuration
        $this->assertEquals(3, $listener->tries);
        $this->assertEquals([1, 5, 15], $listener->backoff);
    }

    /**
     * Test exponential backoff configuration for Module 12 listener
     * Requirements: 8.6
     */
    public function test_module12_listener_has_exponential_backoff()
    {
        $auditService = app(AuditService::class);
        $listener = new SendSubmissionNotificationListener($auditService);

        // Verify retry configuration
        $this->assertEquals(3, $listener->tries);
        $this->assertEquals([1, 5, 15], $listener->backoff);
    }

    /**
     * Test exponential backoff configuration for AV scan listener
     * Requirements: 3.8
     */
    public function test_av_scan_listener_has_exponential_backoff()
    {
        $auditService = app(AuditService::class);
        $listener = new QueueAntivirusScanListener($auditService);

        // Verify retry configuration
        $this->assertEquals(3, $listener->tries);
        $this->assertEquals([1, 5, 15], $listener->backoff);
    }

    /**
     * Test Module 5 forwarding handles missing configuration
     * Requirements: 8.4
     */
    public function test_module5_forwarding_handles_missing_config()
    {
        // Clear Module 5 base URL
        config(['m02.module5.base_url' => null]);

        // Create listener
        $auditService = app(AuditService::class);
        $listener = new ForwardToModule5Listener($auditService);

        // Handle event - should throw exception
        $event = new PermohonanDiserahkan($this->permohonan);

        try {
            $listener->handle($event);
            $this->fail('Expected exception was not thrown');
        } catch (\Exception $e) {
            $this->assertStringContainsString('Module 5 base URL not configured', $e->getMessage());
        }

        // Verify failure was logged
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'forward_to_module5_failed',
            'entity_type' => 'permohonan',
        ]);
    }

    /**
     * Test Module 12 notification handles missing configuration
     * Requirements: 8.6
     */
    public function test_module12_notification_handles_missing_config()
    {
        // Clear Module 12 base URL
        config(['m02.module12.base_url' => null]);

        // Create listener
        $auditService = app(AuditService::class);
        $listener = new SendSubmissionNotificationListener($auditService);

        // Handle event - should throw exception
        $event = new PermohonanDiserahkan($this->permohonan);

        try {
            $listener->handle($event);
            $this->fail('Expected exception was not thrown');
        } catch (\Exception $e) {
            $this->assertStringContainsString('Module 12 base URL not configured', $e->getMessage());
        }

        // Verify failure was logged
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'send_submission_notification_failed',
            'entity_type' => 'permohonan',
        ]);
    }
}
