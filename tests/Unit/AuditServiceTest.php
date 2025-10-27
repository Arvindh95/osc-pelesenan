<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Company;
use App\Models\AuditLog;
use App\Services\AuditService;
use Tests\TestCase;

class AuditServiceTest extends TestCase
{
    private AuditService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(AuditService::class);
    }

    public function test_log_creates_audit_log_entry()
    {
        $user = $this->createUser();

        $this->service->log('test_action', 'App\\Models\\User', $user->id, ['key' => 'value']);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'test_action',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => $user->id
        ]);
    }

    public function test_log_stores_metadata_correctly()
    {
        $user = $this->createUser();
        $metadata = [
            'key1' => 'value1',
            'key2' => 'value2',
            'nested' => ['inner' => 'data']
        ];

        $this->service->log('test_action', 'App\\Models\\User', $user->id, $metadata);

        $auditLog = AuditLog::where('action', 'test_action')->latest()->first();
        
        $this->assertNotNull($auditLog);
        
        // Check that our metadata is included
        $this->assertEquals('value1', $auditLog->meta['key1']);
        $this->assertEquals('value2', $auditLog->meta['key2']);
        $this->assertEquals(['inner' => 'data'], $auditLog->meta['nested']);
        
        // Check that request metadata is also included
        $this->assertArrayHasKey('ip_address', $auditLog->meta);
        $this->assertArrayHasKey('user_agent', $auditLog->meta);
    }

    public function test_log_without_metadata()
    {
        $user = $this->createUser();

        $this->service->log('test_action', 'App\\Models\\User', $user->id);

        $auditLog = AuditLog::where('action', 'test_action')->latest()->first();
        
        $this->assertNotNull($auditLog);
        // Should still have request metadata even when no custom metadata is provided
        $this->assertArrayHasKey('ip_address', $auditLog->meta);
        $this->assertArrayHasKey('user_agent', $auditLog->meta);
    }

    public function test_log_user_action_with_authenticated_user()
    {
        $user = $this->createUser();
        $company = $this->createCompany();
        
        $this->actingAs($user);

        $this->service->logUserAction($user, 'test_user_action', $company, ['extra' => 'data']);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'test_user_action',
            'entity_type' => 'App\\Models\\Company',
            'entity_id' => $company->id
        ]);
    }

    public function test_log_user_action_stores_metadata()
    {
        $user = $this->createUser();
        $company = $this->createCompany();
        $metadata = ['custom' => 'metadata'];

        $this->service->logUserAction($user, 'test_action', $company, $metadata);

        $auditLog = AuditLog::where('action', 'test_action')->latest()->first();
        
        $this->assertNotNull($auditLog);
        // Check that our custom metadata is included
        $this->assertEquals('metadata', $auditLog->meta['custom']);
        // Check that request metadata is also included
        $this->assertArrayHasKey('ip_address', $auditLog->meta);
        $this->assertArrayHasKey('user_agent', $auditLog->meta);
    }

    public function test_log_user_action_without_metadata()
    {
        $user = $this->createUser();
        $company = $this->createCompany();

        $this->service->logUserAction($user, 'test_action', $company);

        $auditLog = AuditLog::where('action', 'test_action')->latest()->first();
        
        $this->assertNotNull($auditLog);
        // Should still have request metadata even when no custom metadata is provided
        $this->assertArrayHasKey('ip_address', $auditLog->meta);
        $this->assertArrayHasKey('user_agent', $auditLog->meta);
    }

    public function test_log_handles_different_entity_types()
    {
        $user = $this->createUser();
        $company = $this->createCompany();

        // Test with User entity
        $this->service->log('user_action', 'App\\Models\\User', $user->id);
        
        // Test with Company entity
        $this->service->log('company_action', 'App\\Models\\Company', $company->id);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'user_action',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => $user->id
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'company_action',
            'entity_type' => 'App\\Models\\Company',
            'entity_id' => $company->id
        ]);
    }

    public function test_log_with_null_actor()
    {
        $user = $this->createUser();

        $this->service->log('system_action', 'App\\Models\\User', $user->id);

        $auditLog = AuditLog::where('action', 'system_action')->latest()->first();
        
        $this->assertNotNull($auditLog);
        $this->assertNull($auditLog->actor_id);
    }

    public function test_log_user_action_with_different_models()
    {
        $actor = $this->createUser();
        $targetUser = $this->createUser();
        $company = $this->createCompany();

        // Test logging action on User model
        $this->service->logUserAction($actor, 'user_updated', $targetUser);
        
        // Test logging action on Company model
        $this->service->logUserAction($actor, 'company_created', $company);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $actor->id,
            'action' => 'user_updated',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => $targetUser->id
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $actor->id,
            'action' => 'company_created',
            'entity_type' => 'App\\Models\\Company',
            'entity_id' => $company->id
        ]);
    }

    public function test_audit_log_timestamps_are_set()
    {
        $user = $this->createUser();

        $this->service->log('test_action', 'App\\Models\\User', $user->id);

        $auditLog = AuditLog::where('action', 'test_action')->latest()->first();
        
        $this->assertNotNull($auditLog);
        $this->assertNotNull($auditLog->created_at);
    }

    public function test_multiple_audit_logs_for_same_entity()
    {
        $user = $this->createUser();

        $this->service->log('action_1', 'App\\Models\\User', $user->id, ['step' => 1]);
        $this->service->log('action_2', 'App\\Models\\User', $user->id, ['step' => 2]);
        $this->service->log('action_3', 'App\\Models\\User', $user->id, ['step' => 3]);

        $auditLogs = AuditLog::where('entity_type', 'App\\Models\\User')
            ->where('entity_id', $user->id)
            ->orderBy('created_at')
            ->get();

        $this->assertCount(3, $auditLogs);
        $this->assertEquals('action_1', $auditLogs[0]->action);
        $this->assertEquals('action_2', $auditLogs[1]->action);
        $this->assertEquals('action_3', $auditLogs[2]->action);
    }

    public function test_log_with_complex_metadata()
    {
        $user = $this->createUser();
        $complexMetadata = [
            'string' => 'value',
            'number' => 123,
            'boolean' => true,
            'null' => null,
            'array' => [1, 2, 3],
            'nested_object' => [
                'inner_string' => 'inner_value',
                'inner_array' => ['a', 'b', 'c']
            ]
        ];

        $this->service->log('complex_action', 'App\\Models\\User', $user->id, $complexMetadata);

        $auditLog = AuditLog::where('action', 'complex_action')->latest()->first();
        
        $this->assertNotNull($auditLog);
        
        // Check that all our complex metadata is included
        $this->assertEquals('value', $auditLog->meta['string']);
        $this->assertEquals(123, $auditLog->meta['number']);
        $this->assertTrue($auditLog->meta['boolean']);
        $this->assertNull($auditLog->meta['null']);
        $this->assertEquals([1, 2, 3], $auditLog->meta['array']);
        $this->assertEquals([
            'inner_string' => 'inner_value',
            'inner_array' => ['a', 'b', 'c']
        ], $auditLog->meta['nested_object']);
        
        // Check that request metadata is also included
        $this->assertArrayHasKey('ip_address', $auditLog->meta);
        $this->assertArrayHasKey('user_agent', $auditLog->meta);
    }
}