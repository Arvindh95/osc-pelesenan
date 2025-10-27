<?php

namespace App\Exceptions;

use Exception;

class ExternalServiceException extends Exception
{
    protected string $serviceName;

    public function __construct(string $serviceName, string $message = null, ?Exception $previous = null)
    {
        $this->serviceName = $serviceName;
        $message = $message ?: "External service '{$serviceName}' is temporarily unavailable";
        
        parent::__construct($message, 0, $previous);
    }

    public function getServiceName(): string
    {
        return $this->serviceName;
    }
}