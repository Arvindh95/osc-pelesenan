<?php

namespace App\Services\M01;

use App\Models\User;

class IdentityVerificationService
{
    public function __construct(
        private MockIdentityClient $client,
        private AuditService $auditService
    ) {}

    /**
     * Verify user identity using the MockIdentityClient and update user status.
     *
     * @param User $user The user whose identity is being verified
     * @param string $icNo The IC number to verify
     * @return bool Whether the verification was successful
     */
    public function verifyIdentity(User $user, string $icNo): bool
    {
        // Call the mock identity client to perform verification
        $result = $this->client->verify($icNo);
        
        // Update user verification status based on result
        $this->updateVerificationStatus($user, $result->isVerified());
        
        // Create audit log entry for the verification attempt
        $this->auditService->logIdentityVerification(
            user: $user,
            verified: $result->isVerified(),
            meta: array_merge($result->getMetadata() ?? [], [
                'ic_no_provided' => $icNo,
                'verification_message' => $result->getMessage(),
            ])
        );
        
        return $result->isVerified();
    }

    /**
     * Update the user's verification status in the database.
     *
     * @param User $user The user to update
     * @param bool $verified Whether the user is verified
     * @return void
     */
    private function updateVerificationStatus(User $user, bool $verified): void
    {
        $user->update([
            'status_verified_person' => $verified,
        ]);
    }
}