<?php

namespace App\Exceptions;

class CompanyException extends BusinessLogicException
{
    public static function alreadyLinked(): self
    {
        return new self(
            'Company is already linked to another user.',
            'COMPANY_ALREADY_LINKED',
            409
        );
    }

    public static function notFound(): self
    {
        return new self(
            'Company not found.',
            'COMPANY_NOT_FOUND',
            404
        );
    }

    public static function invalidSSMNumber(): self
    {
        return new self(
            'Invalid SSM number format.',
            'INVALID_SSM_NUMBER',
            422
        );
    }

    public static function verificationFailed(string $reason = null): self
    {
        $message = 'Company verification failed.';
        if ($reason) {
            $message .= ' Reason: ' . $reason;
        }

        return new self(
            $message,
            'COMPANY_VERIFICATION_FAILED',
            422
        );
    }

    public static function unauthorizedLinking(): self
    {
        return new self(
            'You are not authorized to link to this company.',
            'UNAUTHORIZED_COMPANY_LINKING',
            403
        );
    }
}