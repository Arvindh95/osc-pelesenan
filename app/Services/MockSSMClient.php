<?php

namespace App\Services;

class MockSSMClient
{
    /**
     * Check company status using mock logic
     * 
     * @param string $ssmNo The SSM number to verify
     * @return CompanyStatusResult
     */
    public function checkCompanyStatus(string $ssmNo): CompanyStatusResult
    {
        $status = $this->mockStatusLogic($ssmNo);
        $companyName = $this->generateMockCompanyName($ssmNo);
        
        return match ($status) {
            'active' => new CompanyStatusResult(
                status: 'active',
                message: 'Company is active and registered with SSM',
                companyName: $companyName,
                metadata: [
                    'ssm_no' => $ssmNo,
                    'verification_method' => 'mock_ssm_adapter',
                    'checked_at' => now()->toISOString(),
                    'registration_status' => 'valid'
                ]
            ),
            'inactive' => new CompanyStatusResult(
                status: 'inactive',
                message: 'Company is inactive or suspended',
                companyName: $companyName,
                metadata: [
                    'ssm_no' => $ssmNo,
                    'verification_method' => 'mock_ssm_adapter',
                    'checked_at' => now()->toISOString(),
                    'registration_status' => 'inactive'
                ]
            ),
            default => new CompanyStatusResult(
                status: 'unknown',
                message: 'Company status could not be determined',
                companyName: null,
                metadata: [
                    'ssm_no' => $ssmNo,
                    'verification_method' => 'mock_ssm_adapter',
                    'checked_at' => now()->toISOString(),
                    'registration_status' => 'not_found'
                ]
            )
        };
    }

    /**
     * Mock status logic: SSM starting with "SSM-" = active
     * 
     * @param string $ssmNo
     * @return string
     */
    private function mockStatusLogic(string $ssmNo): string
    {
        // Trim whitespace and ensure SSM number is not empty
        $trimmedSsmNo = trim($ssmNo);
        if (empty($trimmedSsmNo)) {
            return 'unknown';
        }
        
        // SSM numbers starting with "SSM-" are considered active
        if (str_starts_with(strtoupper($trimmedSsmNo), 'SSM-')) {
            return 'active';
        }
        
        // All other valid SSM numbers are considered inactive
        // Only return unknown for truly invalid/empty cases
        return 'inactive';
    }

    /**
     * Generate a mock company name based on SSM number
     * 
     * @param string $ssmNo
     * @return string|null
     */
    private function generateMockCompanyName(string $ssmNo): ?string
    {
        $status = $this->mockStatusLogic($ssmNo);
        
        if ($status === 'unknown') {
            return null;
        }
        
        // Generate a mock company name based on the SSM number
        $suffix = match ($status) {
            'active' => 'Sdn Bhd',
            'inactive' => 'Sdn Bhd (Inactive)',
            default => 'Sdn Bhd'
        };
        
        // Extract identifier from SSM number for company name
        $identifier = preg_replace('/[^A-Z0-9]/', '', strtoupper($ssmNo));
        $identifier = substr($identifier, 0, 8); // Limit to 8 characters
        
        return "Mock Company {$identifier} {$suffix}";
    }
}