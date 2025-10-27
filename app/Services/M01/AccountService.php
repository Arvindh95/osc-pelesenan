<?php

namespace App\Services\M01;

use App\Models\User;

class AccountService
{
    public function __construct(
        private AuditService $auditService
    ) {}

    /**
     * Deactivate a user account with soft delete and token revocation.
     *
     * @param User $user The user to deactivate
     * @return void
     */
    public function deactivateAccount(User $user): void
    {
        // Revoke all active Sanctum tokens for the user
        $tokenCount = $this->revokeAllTokens($user);

        // Perform soft delete on user record
        $user->delete();

        // Create audit log entry for account deactivation
        $this->auditService->logAccountEvent($user, 'account_deactivated', [
            'user_email' => $user->email,
            'revoked_token_count' => $tokenCount,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'deactivated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Revoke all active Sanctum tokens for a user.
     *
     * @param User $user The user whose tokens should be revoked
     * @return void
     */
    private function revokeAllTokens(User $user): int
    {
        // Get count of tokens before deletion for audit purposes
        $tokenCount = $user->tokens()->count();

        // Delete all tokens for the user
        $user->tokens()->delete();

        // Return token count for inclusion in main audit log
        return $tokenCount;
    }
}