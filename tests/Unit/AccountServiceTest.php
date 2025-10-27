<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\AuditLog;
use App\Services\AccountService;
use Tests\TestCase;

class AccountServiceTest extends TestCase
{
    private AccountService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(AccountService::class);
    }

    public function test_deactivate_account_soft_deletes_user()
    {
        $user = $this->createUser();

        $this->service->deactivateAccount($user);

        $this->assertSoftDeleted('users', [
            'id' => $user->id
        ]);
    }

    public function test_deactivate_account_revokes_all_tokens()
    {
        $user = $this->createUser();
        
        // Create multiple tokens
        $user->createToken('token1');
        $user->createToken('token2');
        $user->createToken('token3');

        $this->assertEquals(3, $user->tokens()->count());

        $this->service->deactivateAccount($user);

        $user->refresh();
        $this->assertEquals(0, $user->tokens()->count());
    }

    public function test_deactivate_account_creates_audit_log()
    {
        $user = $this->createUser();

        $this->service->deactivateAccount($user);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'account_deactivated',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => $user->id
        ]);
    }

    public function test_deactivate_account_audit_log_contains_metadata()
    {
        $user = $this->createUser([
            'email' => 'john@example.com',
            'name' => 'John Doe'
        ]);

        $this->service->deactivateAccount($user);

        $auditLog = AuditLog::where('action', 'account_deactivated')
            ->where('actor_id', $user->id)
            ->latest()
            ->first();

        $this->assertNotNull($auditLog);
        $this->assertEquals('john@example.com', $auditLog->meta['user_email']);
        $this->assertArrayHasKey('deactivated_at', $auditLog->meta);
    }

    public function test_deactivate_account_preserves_user_data()
    {
        $user = $this->createUser([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'ic_no' => '123456789012',
            'status_verified_person' => true,
            'role' => 'PEMOHON'
        ]);

        $this->service->deactivateAccount($user);

        $deletedUser = User::withTrashed()->find($user->id);
        
        $this->assertNotNull($deletedUser);
        $this->assertEquals('John Doe', $deletedUser->name);
        $this->assertEquals('john@example.com', $deletedUser->email);
        $this->assertEquals('123456789012', $deletedUser->ic_no);
        $this->assertTrue($deletedUser->status_verified_person);
        $this->assertEquals('PEMOHON', $deletedUser->role);
        $this->assertNotNull($deletedUser->deleted_at);
    }

    public function test_deactivate_account_handles_user_without_tokens()
    {
        $user = $this->createUser();
        
        // Ensure user has no tokens
        $this->assertEquals(0, $user->tokens()->count());

        $this->service->deactivateAccount($user);

        $this->assertSoftDeleted('users', [
            'id' => $user->id
        ]);

        // Should still create audit log
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'account_deactivated'
        ]);
    }

    public function test_deactivate_account_multiple_calls_on_same_user()
    {
        $user = $this->createUser();

        // First deactivation
        $this->service->deactivateAccount($user);
        $this->assertSoftDeleted('users', ['id' => $user->id]);

        $initialAuditCount = AuditLog::where('actor_id', $user->id)
            ->where('action', 'account_deactivated')
            ->count();

        // Second deactivation (should not create duplicate audit log)
        $this->service->deactivateAccount($user);

        $finalAuditCount = AuditLog::where('actor_id', $user->id)
            ->where('action', 'account_deactivated')
            ->count();

        $this->assertEquals($initialAuditCount, $finalAuditCount);
    }

    public function test_deactivate_account_with_admin_user()
    {
        $admin = $this->createUser(['role' => 'PENTADBIR_SYS']);
        $admin->createToken('admin-token');

        $this->service->deactivateAccount($admin);

        $this->assertSoftDeleted('users', [
            'id' => $admin->id
        ]);

        // Check tokens revoked
        $admin->refresh();
        $this->assertEquals(0, $admin->tokens()->count());

        // Check audit log
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $admin->id,
            'action' => 'account_deactivated'
        ]);
    }

    public function test_deactivate_account_does_not_affect_other_users()
    {
        $user1 = $this->createUser(['email' => 'user1@example.com']);
        $user2 = $this->createUser(['email' => 'user2@example.com']);
        
        $user1->createToken('token1');
        $user2->createToken('token2');

        $this->service->deactivateAccount($user1);

        // Check user1 is deactivated
        $this->assertSoftDeleted('users', ['id' => $user1->id]);
        $user1->refresh();
        $this->assertEquals(0, $user1->tokens()->count());

        // Check user2 is unaffected
        $this->assertDatabaseHas('users', [
            'id' => $user2->id,
            'deleted_at' => null
        ]);
        $user2->refresh();
        $this->assertEquals(1, $user2->tokens()->count());
    }
}