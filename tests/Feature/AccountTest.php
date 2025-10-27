<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AuditLog;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AccountTest extends TestCase
{
    public function test_user_can_deactivate_account_successfully()
    {
        $user = $this->createUser();
        $token = $this->actingAsUser($user);

        $response = $this->postJson('/api/account/deactivate');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Account deactivated successfully'
            ]);

        // Check user is soft deleted
        $this->assertSoftDeleted('users', [
            'id' => $user->id
        ]);

        // Check audit log creation
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'account_deactivated',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => $user->id
        ]);
    }

    public function test_account_deactivation_revokes_all_tokens()
    {
        $user = $this->createUser();
        
        // Create multiple tokens
        $token1 = $user->createToken('token1')->plainTextToken;
        $token2 = $user->createToken('token2')->plainTextToken;
        $token3 = $user->createToken('token3')->plainTextToken;

        // Use one token for authentication
        $this->withHeaders(['Authorization' => 'Bearer ' . $token1]);

        // Verify tokens exist before deactivation
        $this->assertEquals(3, $user->tokens()->count());

        $response = $this->postJson('/api/account/deactivate');

        $response->assertStatus(200);

        // Check all tokens are revoked
        $user->refresh();
        $this->assertEquals(0, $user->tokens()->count());
    }

    public function test_account_deactivation_requires_authentication()
    {
        $response = $this->postJson('/api/account/deactivate');

        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_deactivated_user_cannot_authenticate()
    {
        $user = $this->createUser([
            'email' => 'john@example.com',
            'password' => bcrypt('password123')
        ]);

        // Deactivate the account
        $token = $this->actingAsUser($user);
        $this->postJson('/api/account/deactivate');

        // Try to login with deactivated account
        $response = $this->postJson('/api/auth/login', [
            'email' => 'john@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials']);
    }

    public function test_deactivated_user_tokens_are_invalid()
    {
        $user = $this->createUser();
        $token = $this->actingAsUser($user);

        // Verify token works before deactivation
        $response = $this->getJson('/api/profile/verify-identity');
        $this->assertNotEquals(401, $response->getStatusCode());

        // Deactivate account
        $this->postJson('/api/account/deactivate');

        // Try to use the same token after deactivation
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/profile/verify-identity', ['ic_no' => '123456789012']);

        $response->assertStatus(401);
    }

    public function test_account_deactivation_preserves_user_data()
    {
        $user = $this->createUser([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'ic_no' => '123456789012',
            'status_verified_person' => true,
            'role' => 'PEMOHON'
        ]);

        $this->actingAsUser($user);

        $response = $this->postJson('/api/account/deactivate');

        $response->assertStatus(200);

        // Check user data is preserved (soft delete)
        $deletedUser = User::withTrashed()->find($user->id);
        $this->assertNotNull($deletedUser);
        $this->assertEquals('John Doe', $deletedUser->name);
        $this->assertEquals('john@example.com', $deletedUser->email);
        $this->assertEquals('123456789012', $deletedUser->ic_no);
        $this->assertTrue($deletedUser->status_verified_person);
        $this->assertEquals('PEMOHON', $deletedUser->role);
        $this->assertNotNull($deletedUser->deleted_at);
    }

    public function test_account_deactivation_audit_log_contains_metadata()
    {
        $user = $this->createUser([
            'name' => 'John Doe',
            'email' => 'john@example.com'
        ]);

        $token = $this->actingAsUser($user);

        $response = $this->postJson('/api/account/deactivate');

        $response->assertStatus(200);

        // Check audit log metadata
        $auditLog = AuditLog::where('action', 'account_deactivated')
            ->where('actor_id', $user->id)
            ->latest()
            ->first();

        $this->assertNotNull($auditLog);
        $this->assertEquals($user->id, $auditLog->entity_id);
        $this->assertEquals('App\\Models\\User', $auditLog->entity_type);
        $this->assertArrayHasKey('user_email', $auditLog->meta);
        $this->assertEquals('john@example.com', $auditLog->meta['user_email']);
    }

    public function test_multiple_account_deactivation_attempts()
    {
        $user = $this->createUser();
        $token = $this->actingAsUser($user);

        // First deactivation
        $response = $this->postJson('/api/account/deactivate');
        $response->assertStatus(200);

        // Try to deactivate again (should fail due to authentication)
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/account/deactivate');

        $response->assertStatus(401);
    }

    public function test_account_deactivation_with_linked_companies()
    {
        $user = $this->createUser();
        $company = $this->createCompany(['owner_user_id' => $user->id]);
        
        $this->actingAsUser($user);

        $response = $this->postJson('/api/account/deactivate');

        $response->assertStatus(200);

        // Check user is deactivated
        $this->assertSoftDeleted('users', ['id' => $user->id]);

        // Check company ownership is preserved
        $company->refresh();
        $this->assertEquals($user->id, $company->owner_user_id);
    }

    public function test_account_deactivation_creates_single_audit_log()
    {
        $user = $this->createUser();
        $this->actingAsUser($user);

        // Count existing audit logs
        $initialCount = AuditLog::where('actor_id', $user->id)->count();

        $response = $this->postJson('/api/account/deactivate');

        $response->assertStatus(200);

        // Check only one new audit log is created
        $finalCount = AuditLog::where('actor_id', $user->id)->count();
        $this->assertEquals($initialCount + 1, $finalCount);

        // Verify it's the correct audit log
        $auditLog = AuditLog::where('actor_id', $user->id)
            ->where('action', 'account_deactivated')
            ->latest()
            ->first();

        $this->assertNotNull($auditLog);
    }
}