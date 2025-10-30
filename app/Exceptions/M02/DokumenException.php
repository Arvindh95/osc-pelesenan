<?php

namespace App\Exceptions\M02;

use App\Exceptions\BusinessLogicException;

class DokumenException extends BusinessLogicException
{
    public static function invalidFileType(string $actualType, array $allowedTypes): self
    {
        $allowed = implode(', ', array_map('strtoupper', $allowedTypes));
        return new self(
            "File type not allowed. Allowed types: {$allowed}",
            'INVALID_FILE_TYPE',
            422
        );
    }

    public static function fileSizeExceeded(int $actualSize, int $maxSize): self
    {
        $maxSizeMB = round($maxSize / 1024 / 1024, 2);
        $actualSizeMB = round($actualSize / 1024 / 1024, 2);
        return new self(
            "File size ({$actualSizeMB} MB) exceeds maximum allowed size ({$maxSizeMB} MB).",
            'FILE_SIZE_EXCEEDED',
            422
        );
    }

    public static function documentAlreadyValidated(): self
    {
        return new self(
            'Cannot delete a validated document.',
            'DOCUMENT_ALREADY_VALIDATED',
            422
        );
    }

    public static function permohonanNotDraft(): self
    {
        return new self(
            'Documents can only be deleted when application is in draft status.',
            'PERMOHONAN_NOT_DRAFT',
            422
        );
    }

    public function render()
    {
        return response()->json([
            'error' => $this->getMessage(),
            'error_code' => $this->getErrorCode(),
        ], $this->getStatusCode());
    }
}
