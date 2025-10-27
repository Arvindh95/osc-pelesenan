<?php

namespace App\Http\Controllers\M01;

use App\Http\Controllers\Controller;
use App\Services\M01\AccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AccountController extends Controller
{
    public function __construct(
        private AccountService $accountService
    ) {}

    /**
     * Deactivate the authenticated user's account.
     *
     * @return JsonResponse
     */
    public function deactivate(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            $this->accountService->deactivateAccount($user);

            return response()->json([
                'message' => 'Account deactivated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Account deactivation failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}