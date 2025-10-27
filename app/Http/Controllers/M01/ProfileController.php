<?php

namespace App\Http\Controllers\M01;

use App\Http\Controllers\Controller;
use App\Http\Requests\M01\VerifyIdentityRequest;
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