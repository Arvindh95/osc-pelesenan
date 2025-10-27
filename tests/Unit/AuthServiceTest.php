<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\AuditLog;
use App\Services\AuthService;
use App\Services\AuditService;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthServiceTest extends TestCase
{
    private AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = app(AuthService::class);
    }

    public function test_register_creates_user_with_correct_attributes()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'ic_no' => '123456789012'
        ];

        $user = $this->authService->register($userData);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('john@example.com', $user->email);
        $this->assertEquals('123456789012', $user->ic_no);
        $this->assertEquals('PEMOHON', $user->role);
        $this->assertFalse($user->status_verified_person);
        $this->assertTrue(Hash::check('password123', $user->password));
    }

    public function test_register_creates_audit_log()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'ic_no' => '123456789012'
        ];

        $user = $this->authService->register($userData);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'user_registered',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => $user->id
        ]);
    }

    public function test_login_with_valid_credentials_returns_token()
    {
        $user = $this->createUser([
            'email' => 'john@example.com',
            'password' => Hash::make('password123')
        ]);

        $credentials = [
            'email' => 'john@example.com',
            'password' => 'password123'
        ];

        $token = $this->authService->login($credentials);

        $this->assertIsString($token);
        $this->assertNotEmpty($token);
    }

    public function test_login_with_invalid_credentials_throws_exception()
    {
        $user = $this->createUser([
            'email' => 'john@example.com',
            'password' => Hash::make('password123')
        ]);

        $credentials = [
            'email' => 'john@example.com',
            'password' => 'wrong_password'
        ];

        $this->expectException(ValidationException::class);
        $this->authService->login($credentials);
    }

    public function test_login_with_nonexistent_user_throws_exception()
    {
        $credentials = [
            'email' => 'nonexistent@example.com',
            'password' => 'password123'
        ];

        $this->expectException(ValidationException::class);
        $this->authService->login($credentials);
    }

    public function test_login_with_deleted_user_throws_exception()
    {
        $user = $this->createUser([
            'email' => 'john@example.com',
            'password' => Hash::make('password123')
        ]);

        $user->delete();

        $credentials = [
            'email' => 'john@example.com',
            'password' => 'password123'
        ];

        $this->expectException(ValidationException::class);
        $this->authService->login($credentials);
    }

    public function test_login_creates_audit_log_on_success()
    {
        $user = $this->createUser([
            'email' => 'john@example.com',
            'password' => Hash::make('password123')
        ]);

        $credentials = [
            'email' => 'john@example.com',
            'password' => 'password123'
        ];

        $token = $this->authService->login($credentials);

        $this->assertNotNull($token);
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $user->id,
            'action' => 'user_logged_in',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => $user->id
        ]);
    }

    public function test_login_does_not_create_audit_log_on_failure()
    {
        $initialCount = AuditLog::count();

        $credentials = [
            'email' => 'nonexistent@example.com',
            'password' => 'password123'
        ];

        try {
            $this->authService->login($credentials);
        } catch (ValidationException $e) {
            // Expected exception
        }

        $this->assertEquals($initialCount, AuditLog::count());
    }
}