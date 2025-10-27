<?php

namespace App\Services;

class MockIdentityClient
{
    /**
     * Verify identity using mock logic
     * 
     * @param string $icNo The IC number to verify
     * @return IdentityVerificationResult
     */
    public function verify(string $icNo): IdentityVerificationResult
    {
        $isVerified = $this->mockVerificationLogic($icNo);
        
        if ($isVerified) {
            return new IdentityVerificationResult(
                verified: true,
                message: 'Identity verification successful',
                metadata: [
                    'ic_no' => $icNo,
                    'verification_method' => 'mock_adapter',
                    'verified_at' => now()->toISOString()
                ]
            );
        }
        
        return new IdentityVerificationResult(
            verified: false,
            message: 'Identity verification failed',
            metadata: [
                'ic_no' => $icNo,
                'verification_method' => 'mock_adapter',
                'reason' => 'IC number does not meet verification criteria',
                'attempted_at' => now()->toISOString()
            ]
        );
    }

    /**
     * Mock verification logic: IC ending with even digit = verified
     * 
     * @param string $icNo
     * @return bool
     */
    private function mockVerificationLogic(string $icNo): bool
    {
        // Trim whitespace and ensure IC number is not empty
        $trimmedIcNo = trim($icNo);
        if ($trimmedIcNo === '') {
            return false;
        }
        
        // Get the last character of the trimmed IC number
        $lastChar = substr($trimmedIcNo, -1);
        
        // Return true if last character is a numeric even digit (0, 2, 4, 6, 8)
        return is_numeric($lastChar) && ((int) $lastChar % 2 === 0);
    }
}