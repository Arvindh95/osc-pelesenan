<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AuditLog;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    public function test_user_can_verify_identity_successfully()
    {
        $user = $this->createUser([
            'ic_no' => '123456789012',
            'status_verified_person' => false
        ]);

        $this->actingAsUser($user);

        // Use IC ending with even digit (2) for successful verification
        $response = $this->postJson('/api/profile/verify-identity', [
            'ic_no' => '123456789012'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'verified' => true,
                'message' => 'Identity verification successful'
            ]);

        // Check user verification status updated
        $user->refresh();
        $this->assertTrue($user->status_verified_person);

        // Check audit log creation
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'identity_verification_attempted',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => $user->id
        ]);
    }

    public function test_user_identity_verification_fails()
    {
        $user = $this->createUser([
            'ic_no' => '123456789013',
            'status_verified_person' => false
        ]);

        $this->actingAsUser($user);

        // Use IC ending with odd digit (3) for failed verification
        $response = $this->postJson('/api/profile/verify-identity', [
            'ic_no' => '123456789013'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'verified' => false,
                'message' => 'Identity verification failed'
            ]);

        // Check user verification status remains false
        $user->refresh();
        $this->assertFalse($user->status_verified_person);

        // Check audit log creation
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'identity_verification_attempted',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => $user->id
        ]);
    }

    public function test_identity_verification_validation_errors()
    {
        $user = $this->createUser();
        $this->actingAsUser($user);

        // Test missing IC number
        $response = $this->postJson('/api/profile/verify-identity', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ic_no']);

        // Test invalid IC number format
        $response = $this->postJson('/api/profile/verify-identity', [
            'ic_no' => 'invalid-ic'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ic_no']);

        // Test IC number too short
        $response = $this->postJson('/api/profile/verify-identity', [
            'ic_no' => '12345'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ic_no']);

        // Test IC number too long
        $response = $this->postJson('/api/profile/verify-identity', [
            'ic_no' => '1234567890123'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ic_no']);
    }

    public function test_identity_verification_requires_authentication()
    {
        $response = $this->postJson('/api/profile/verify-identity', [
            'ic_no' => '123456789012'
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_identity_verification_with_different_ic_number()
    {
        $user = $this->createUser([
            'ic_no' => '123456789012',
            'status_verified_person' => false
        ]);

        $this->actingAsUser($user);

        // Try to verify with different IC number
        $response = $this->postJson('/api/profile/verify-identity', [
            'ic_no' => '987654321098'
        ]);

        $response->assertStatus(200);

        // Check audit log creation with different IC in meta
        $auditLog = AuditLog::where('actor_id', $user->id)
            ->where('action', 'identity_verification_attempted')
            ->latest()
            ->first();

        $this->assertNotNull($auditLog);
        $this->assertEquals('987654321098', $auditLog->meta['ic_no']);
    }

    public function test_already_verified_user_can_verify_again()
    {
        $user = $this->createUser([
            'ic_no' => '123456789012',
            'status_verified_person' => true
        ]);

        $this->actingAsUser($user);

        $response = $this->postJson('/api/profile/verify-identity', [
            'ic_no' => '123456789012'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'verified' => true,
                'message' => 'Identity verification successful'
            ]);

        // User should remain verified
        $user->refresh();
        $this->assertTrue($user->status_verified_person);
    }

    public function test_identity_verification_updates_user_status()
    {
        $user = $this->createUser([
            'ic_no' => '123456789014',
            'status_verified_person' => false
        ]);

        $this->actingAsUser($user);

        // First verification attempt (even digit - success)
        $response = $this->postJson('/api/profile/verify-identity', [
            'ic_no' => '123456789014'
        ]);

        $response->assertStatus(200);
        $user->refresh();
        $this->assertTrue($user->status_verified_person);

        // Reset status for second test
        $user->update(['status_verified_person' => false]);

        // Second verification attempt (odd digit - failure)
        $response = $this->postJson('/api/profile/verify-identity', [
            'ic_no' => '123456789015'
        ]);

        $response->assertStatus(200);
        $user->refresh();
        $this->assertFalse($user->status_verified_person);
    }
}