<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AuditLog;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    public function test_user_can_register_successfully()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'ic_no' => '123456789012'
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'ic_no',
                    'status_verified_person',
                    'role'
                ],
                'token'
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'ic_no' => '123456789012',
            'status_verified_person' => false,
            'role' => 'PEMOHON'
        ]);

        // Check audit log creation
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'user_registered',
            'entity_type' => 'App\\Models\\User'
        ]);
    }

    public function test_user_registration_validation_errors()
    {
        // Test missing required fields
        $response = $this->postJson('/api/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'ic_no']);

        // Test invalid email format
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'ic_no' => '123456789012'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // Test password confirmation mismatch
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different_password',
            'ic_no' => '123456789012'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test invalid IC number format
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'ic_no' => 'invalid-ic'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ic_no']);
    }

    public function test_user_registration_duplicate_email()
    {
        $existingUser = $this->createUser(['email' => 'john@example.com']);

        $userData = [
            'name' => 'Jane Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'ic_no' => '123456789013'
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_registration_duplicate_ic_no()
    {
        $existingUser = $this->createUser(['ic_no' => '123456789012']);

        $userData = [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'ic_no' => '123456789012'
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ic_no']);
    }

    public function test_user_can_login_successfully()
    {
        $user = $this->createUser([
            'email' => 'john@example.com',
            'password' => bcrypt('password123')
        ]);

        $loginData = [
            'email' => 'john@example.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'ic_no',
                    'status_verified_person',
                    'role'
                ],
                'token'
            ]);

        // Check audit log creation
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'user_logged_in',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => $user->id
        ]);
    }

    public function test_user_login_with_invalid_credentials()
    {
        $user = $this->createUser([
            'email' => 'john@example.com',
            'password' => bcrypt('password123')
        ]);

        // Test wrong password
        $response = $this->postJson('/api/auth/login', [
            'email' => 'john@example.com',
            'password' => 'wrong_password'
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials']);

        // Test non-existent email
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials']);
    }

    public function test_user_login_validation_errors()
    {
        // Test missing required fields
        $response = $this->postJson('/api/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);

        // Test invalid email format
        $response = $this->postJson('/api/auth/login', [
            'email' => 'invalid-email',
            'password' => 'password123'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_cannot_login_when_deleted()
    {
        $user = $this->createUser([
            'email' => 'john@example.com',
            'password' => bcrypt('password123')
        ]);

        // Soft delete the user
        $user->delete();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'john@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials']);
    }
}