<?php

namespace App\Services\M01;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private AuditService $auditService
    ) {}

    /**
     * Register a new user with validation and audit logging.
     *
     * @param array $data User registration data (name, email, password, ic_no)
     * @return User The created user instance
     */
    public function register(array $data): User
    {
        // Create the user with default role and verification status
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'ic_no' => $data['ic_no'],
            'role' => 'PEMOHON', // Default role as per requirements
            'status_verified_person' => false, // Default to unverified
        ]);

        // Create audit log entry for registration
        $this->auditService->logAuthEvent('user_registered', $user, [
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return $user;
    }

    /**
     * Authenticate user and generate token.
     *
     * @param array $credentials Login credentials (email, password)
     * @return string The generated Sanctum token
     * @throws ValidationException If authentication fails
     */
    public function login(array $credentials): string
    {
        // Check if user exists and is not soft deleted before attempting authentication
        $user = User::where('email', $credentials['email'])->first();
        if ($user && $user->trashed()) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Attempt authentication using the web guard (which supports attempt method)
        if (!Auth::guard('web')->attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::guard('web')->user();

        // Create audit log entry for successful login
        $this->auditService->logAuthEvent('user_logged_in', $user, [
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Generate and return Sanctum token
        return $user->createToken('auth-token')->plainTextToken;
    }

    /**
     * Log out user and revoke current token.
     *
     * @param User $user The user to log out
     * @return void
     */
    public function logout(User $user): void
    {
        // Get the current token
        $currentToken = $user->currentAccessToken();
        
        // Only delete if it's a real token (has an ID property)
        if ($currentToken && property_exists($currentToken, 'id')) {
            $user->tokens()->where('id', $currentToken->id)->delete();
        }

        // Create audit log entry for logout
        $this->auditService->logAuthEvent('user_logged_out', $user, [
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
