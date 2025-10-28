<?php

namespace App\Http\Controllers\M01;

use App\Http\Controllers\Controller;
use App\Http\Requests\M01\LoginRequest;
use App\Http\Requests\M01\RegisterRequest;
use App\Http\Resources\M01\UserResource;
use App\Services\M01\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * Register a new user.
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $user = $this->authService->register($request->validated());
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => new UserResource($user),
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Registration failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Authenticate user and return token.
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $token = $this->authService->login($request->validated());
            $user = Auth::guard('web')->user();

            return response()->json([
                'user' => new UserResource($user),
                'token' => $token,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Login failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Log out the authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
            
            $this->authService->logout($user);

            return response()->json([
                'message' => 'Successfully logged out.',
            ]);
        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ralat pelayan. Sila cuba lagi kemudian.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}