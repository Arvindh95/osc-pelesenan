<?php

namespace App\Services\M01;

class CompanyStatusResult
{
    public function __construct(
        public readonly string $status,
        public readonly string $message,
        public readonly ?string $companyName = null,
        public readonly ?array $metadata = null
    ) {}

    public function getStatus(): string
    {
        return $this->status;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function getCompanyName(): ?string
    {
        return $this->companyName;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isInactive(): bool
    {
        return $this->status === 'inactive';
    }

    public function isUnknown(): bool
    {
        return $this->status === 'unknown';
    }
}