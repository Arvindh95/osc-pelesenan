<?php

namespace App\Http\Controllers\M01;

use App\Http\Controllers\Controller;
use App\Http\Requests\M01\VerifyIdentityRequest;
use App\Http\Requests\M01\UpdateProfileRequest;
use App\Http\Resources\M01\UserResource;
use App\Services\M01\IdentityVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function __construct(
        private IdentityVerificationService $identityVerificationService
    ) {}

    /**
     * Update the authenticated user's profile.
     *
     * @param UpdateProfileRequest $request
     * @return JsonResponse
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $validated = $request->validated();

            // Update only the fields that were provided
            if (isset($validated['name'])) {
                $user->name = $validated['name'];
            }

            if (isset($validated['email'])) {
                $user->email = $validated['email'];
            }

            $user->save();

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => new UserResource($user),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify user identity using IC number.
     *
     * @param VerifyIdentityRequest $request
     * @return JsonResponse
     */
    public function verifyIdentity(VerifyIdentityRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $icNo = $request->validated()['ic_no'];

            $verified = $this->identityVerificationService->verifyIdentity($user, $icNo);

            // Refresh user data to get updated verification status
            $user->refresh();

            return response()->json([
                'verified' => $verified,
                'message' => $verified
                    ? 'Identity verification successful'
                    : 'Identity verification failed',
                'user' => new UserResource($user),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Identity verification failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}