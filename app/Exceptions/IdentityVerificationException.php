<?php

namespace App\Exceptions;

class IdentityVerificationException extends BusinessLogicException
{
    public static function alreadyVerified(): self
    {
        return new self(
            'User identity is already verified.',
            'IDENTITY_ALREADY_VERIFIED',
            409
        );
    }

    public static function verificationFailed(string $reason = null): self
    {
        $message = 'Identity verification failed.';
        if ($reason) {
            $message .= ' Reason: ' . $reason;
        }

        return new self(
            $message,
            'IDENTITY_VERIFICATION_FAILED',
            422
        );
    }

    public static function invalidIcNumber(): self
    {
        return new self(
            'Invalid IC number format.',
            'INVALID_IC_NUMBER',
            422
        );
    }
}