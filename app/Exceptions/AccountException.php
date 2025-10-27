<?php

namespace App\Exceptions;

class AccountException extends BusinessLogicException
{
    public static function alreadyDeactivated(): self
    {
        return new self(
            'Account is already deactivated.',
            'ACCOUNT_ALREADY_DEACTIVATED',
            409
        );
    }

    public static function deactivationFailed(string $reason = null): self
    {
        $message = 'Account deactivation failed.';
        if ($reason) {
            $message .= ' Reason: ' . $reason;
        }

        return new self(
            $message,
            'ACCOUNT_DEACTIVATION_FAILED',
            500
        );
    }

    public static function cannotDeactivateAdmin(): self
    {
        return new self(
            'System administrator accounts cannot be deactivated.',
            'CANNOT_DEACTIVATE_ADMIN',
            403
        );
    }
}