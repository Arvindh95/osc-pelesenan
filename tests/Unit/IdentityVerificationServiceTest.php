<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\AuditLog;
use App\Services\IdentityVerificationService;
use App\Services\MockIdentityClient;
use Tests\TestCase;

class IdentityVerificationServiceTest extends TestCase
{
    private IdentityVerificationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(IdentityVerificationService::class);
    }

    public function test_verify_identity_with_even_ic_returns_true()
    {
        $user = $this->createUser([
            'ic_no' => '123456789012',
            'status_verified_person' => false
        ]);

        // IC ending with even digit (2)
        $result = $this->service->verifyIdentity($user, '123456789012');

        $this->assertTrue($result);
        
        $user->refresh();
        $this->assertTrue($user->status_verified_person);
    }

    public function test_verify_identity_with_odd_ic_returns_false()
    {
        $user = $this->createUser([
            'ic_no' => '123456789013',
            'status_verified_person' => false
        ]);

        // IC ending with odd digit (3)
        $result = $this->service->verifyIdentity($user, '123456789013');

        $this->assertFalse($result);
        
        $user->refresh();
        $this->assertFalse($user->status_verified_person);
    }

    public function test_verify_identity_creates_audit_log()
    {
        $user = $this->createUser();

        $this->service->verifyIdentity($user, '123456789012');

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'identity_verification_attempted',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => $user->id
        ]);
    }

    public function test_verify_identity_audit_log_contains_metadata()
    {
        $user = $this->createUser();

        $this->service->verifyIdentity($user, '987654321098');

        $auditLog = AuditLog::where('actor_id', $user->id)
            ->where('action', 'identity_verification_attempted')
            ->latest()
            ->first();

        $this->assertNotNull($auditLog);
        $this->assertEquals('987654321098', $auditLog->meta['ic_no']);
        $this->assertArrayHasKey('verification_result', $auditLog->meta);
    }

    public function test_verify_identity_with_different_ic_number()
    {
        $user = $this->createUser([
            'ic_no' => '123456789012',
            'status_verified_person' => false
        ]);

        // Verify with different IC number
        $result = $this->service->verifyIdentity($user, '987654321098');

        // Should still work and update status based on verification result
        $this->assertTrue($result); // 8 is even
        
        $user->refresh();
        $this->assertTrue($user->status_verified_person);
    }

    public function test_verify_identity_updates_already_verified_user()
    {
        $user = $this->createUser([
            'ic_no' => '123456789012',
            'status_verified_person' => true
        ]);

        // Try verification with odd IC (should fail)
        $result = $this->service->verifyIdentity($user, '123456789013');

        $this->assertFalse($result);
        
        $user->refresh();
        $this->assertFalse($user->status_verified_person);
    }

    public function test_verify_identity_handles_edge_case_ic_numbers()
    {
        $user = $this->createUser();

        // Test IC ending with 0 (even)
        $result = $this->service->verifyIdentity($user, '123456789010');
        $this->assertTrue($result);

        // Reset user status
        $user->update(['status_verified_person' => false]);

        // Test IC ending with 1 (odd)
        $result = $this->service->verifyIdentity($user, '123456789011');
        $this->assertFalse($result);
    }

    public function test_verify_identity_preserves_user_data()
    {
        $user = $this->createUser([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'ic_no' => '123456789012',
            'role' => 'PEMOHON'
        ]);

        $this->service->verifyIdentity($user, '123456789012');

        $user->refresh();
        
        // Check other user data is preserved
        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('john@example.com', $user->email);
        $this->assertEquals('123456789012', $user->ic_no);
        $this->assertEquals('PEMOHON', $user->role);
    }
}