<?php

namespace App\Services\M01;

class IdentityVerificationResult
{
    public function __construct(
        public readonly bool $verified,
        public readonly string $message,
        public readonly ?array $metadata = null
    ) {}

    public function isVerified(): bool
    {
        return $this->verified;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }
}