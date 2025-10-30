<?php

namespace App\Exceptions\M02;

use App\Exceptions\BusinessLogicException;

class PermohonanException extends BusinessLogicException
{
    public static function notDraft(): self
    {
        return new self(
            'Application must be in draft status for this operation.',
            'PERMOHONAN_NOT_DRAFT',
            422
        );
    }

    public static function incomplete(array $errors): self
    {
        $exception = new self(
            'Application is incomplete and cannot be submitted.',
            'PERMOHONAN_INCOMPLETE',
            422
        );
        $exception->validationErrors = $errors;
        return $exception;
    }

    public static function companyNotOwned(): self
    {
        return new self(
            'Company does not belong to authenticated user.',
            'COMPANY_NOT_OWNED',
            403
        );
    }

    public static function identityNotVerified(): self
    {
        return new self(
            'User identity must be verified before submitting applications.',
            'IDENTITY_NOT_VERIFIED',
            403
        );
    }

    public static function invalidJenisLesen(int $jenisLesenId): self
    {
        return new self(
            "Invalid jenis_lesen_id: {$jenisLesenId}. License type does not exist.",
            'INVALID_JENIS_LESEN',
            422
        );
    }

    protected array $validationErrors = [];

    public function getValidationErrors(): array
    {
        return $this->validationErrors;
    }

    public function render()
    {
        $response = [
            'error' => $this->getMessage(),
            'error_code' => $this->getErrorCode(),
        ];

        if (!empty($this->validationErrors)) {
            $response['validation_errors'] = $this->validationErrors;
        }

        return response()->json($response, $this->getStatusCode());
    }
}
