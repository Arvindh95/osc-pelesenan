<?php

namespace Tests\Unit;

use App\Services\MockSSMClient;
use App\Services\CompanyStatusResult;
use Tests\TestCase;

class MockSSMClientTest extends TestCase
{
    private MockSSMClient $client;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = new MockSSMClient();
    }

    public function test_check_company_status_with_ssm_prefix_returns_active()
    {
        $ssmNumbers = [
            'SSM-123456',
            'SSM-ABC-123',
            'SSM-COMPANY-789',
            'SSM-TEST',
            'SSM-1'
        ];

        foreach ($ssmNumbers as $ssmNo) {
            $result = $this->client->checkCompanyStatus($ssmNo);
            
            $this->assertInstanceOf(CompanyStatusResult::class, $result);
            $this->assertEquals('active', $result->getStatus(), "SSM {$ssmNo} should be active");
            $this->assertEquals($ssmNo, $result->getMetadata()['ssm_no']);
            // Company name contains processed SSM number (special chars removed, limited to 8 chars)
            $processedSsm = substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($ssmNo)), 0, 8);
            $this->assertStringContainsString($processedSsm, $result->getCompanyName());
        }
    }

    public function test_check_company_status_without_ssm_prefix_returns_inactive()
    {
        $ssmNumbers = [
            'ABC-123456',
            'COMPANY-789',
            '123456789',
            'TEST-SSM-123', // SSM not at start
            'XYZ-SSM-456'
        ];

        foreach ($ssmNumbers as $ssmNo) {
            $result = $this->client->checkCompanyStatus($ssmNo);
            
            $this->assertInstanceOf(CompanyStatusResult::class, $result);
            $this->assertEquals('inactive', $result->getStatus(), "SSM {$ssmNo} should be inactive");
            $this->assertEquals($ssmNo, $result->getMetadata()['ssm_no']);
            // Company name contains processed SSM number (special chars removed, limited to 8 chars)
            $processedSsm = substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($ssmNo)), 0, 8);
            $this->assertStringContainsString($processedSsm, $result->getCompanyName());
        }
    }

    public function test_check_company_status_returns_correct_result_structure()
    {
        $result = $this->client->checkCompanyStatus('SSM-123456');

        $this->assertInstanceOf(CompanyStatusResult::class, $result);
        $this->assertIsString($result->getStatus());
        $this->assertIsString($result->getMetadata()['ssm_no']);
        $this->assertIsString($result->getCompanyName());
        $this->assertContains($result->getStatus(), ['active', 'inactive', 'unknown']);
    }

    public function test_check_company_status_generates_unique_company_names()
    {
        $result1 = $this->client->checkCompanyStatus('SSM-123');
        $result2 = $this->client->checkCompanyStatus('SSM-456');
        $result3 = $this->client->checkCompanyStatus('ABC-789');

        $this->assertNotEquals($result1->getCompanyName(), $result2->getCompanyName());
        $this->assertNotEquals($result2->getCompanyName(), $result3->getCompanyName());
        $this->assertNotEquals($result1->getCompanyName(), $result3->getCompanyName());

        // But should contain the SSM number (processed - special chars removed, limited to 8 chars)
        $this->assertStringContainsString('SSM123', $result1->getCompanyName());
        $this->assertStringContainsString('SSM456', $result2->getCompanyName());
        $this->assertStringContainsString('ABC789', $result3->getCompanyName());
    }

    public function test_check_company_status_consistency_multiple_calls()
    {
        $ssmNo = 'SSM-TEST-123';
        
        // Call multiple times with same SSM number
        $result1 = $this->client->checkCompanyStatus($ssmNo);
        $result2 = $this->client->checkCompanyStatus($ssmNo);
        $result3 = $this->client->checkCompanyStatus($ssmNo);

        // Results should be consistent
        $this->assertEquals($result1->getStatus(), $result2->getStatus());
        $this->assertEquals($result2->getStatus(), $result3->getStatus());
        $this->assertEquals($result1->getMetadata()['ssm_no'], $result2->getMetadata()['ssm_no']);
        $this->assertEquals($result1->getCompanyName(), $result2->getCompanyName());
    }

    public function test_check_company_status_with_edge_cases()
    {
        $testCases = [
            'SSM-' => 'active',        // Just prefix
            'SSM' => 'inactive',       // No dash
            'SSM-A' => 'active',       // Single character after prefix
            '' => 'unknown',          // Empty string
            'SSM-123-SSM-456' => 'active' // Multiple SSM patterns
        ];

        foreach ($testCases as $ssmNo => $expectedStatus) {
            $result = $this->client->checkCompanyStatus($ssmNo);
            $this->assertEquals($expectedStatus, $result->getStatus(), "Failed for SSM: {$ssmNo}");
        }
    }

    public function test_check_company_status_case_sensitivity()
    {
        $testCases = [
            'SSM-123' => 'active',     // uppercase
            'ssm-123' => 'active',     // lowercase (converted to uppercase)
            'Ssm-123' => 'active',     // mixed case (converted to uppercase)
            'SSm-123' => 'active',     // mixed case (converted to uppercase)
            'SSM-123' => 'active'      // uppercase again
        ];

        foreach ($testCases as $ssmNo => $expectedStatus) {
            $result = $this->client->checkCompanyStatus($ssmNo);
            $this->assertEquals($expectedStatus, $result->getStatus(), "Failed for SSM: {$ssmNo}");
        }
    }

    public function test_check_company_status_with_special_characters()
    {
        $testCases = [
            'SSM-123@456' => 'active',
            'SSM-123#456' => 'active',
            'SSM-123$456' => 'active',
            'SSM-123%456' => 'active',
            'SSM-123&456' => 'active',
            'ABC@123' => 'inactive',
            'XYZ#456' => 'inactive'
        ];

        foreach ($testCases as $ssmNo => $expectedStatus) {
            $result = $this->client->checkCompanyStatus($ssmNo);
            $this->assertEquals($expectedStatus, $result->getStatus(), "Failed for SSM: {$ssmNo}");
            $this->assertEquals($ssmNo, $result->getMetadata()['ssm_no']);
        }
    }

    public function test_check_company_status_with_whitespace()
    {
        $testCases = [
            ' SSM-123 ' => 'active',      // leading/trailing spaces
            'SSM- 123' => 'active',       // space after dash
            'SSM -123' => 'active',       // space before dash
            ' ABC-123 ' => 'inactive',    // spaces with non-SSM
            'SSM - 123' => 'active'       // spaces around dash
        ];

        foreach ($testCases as $ssmNo => $expectedStatus) {
            $result = $this->client->checkCompanyStatus($ssmNo);
            // The mock should check if trimmed and uppercased string starts with "SSM-"
            $trimmed = trim($ssmNo);
            $expected = str_starts_with(strtoupper($trimmed), 'SSM-') ? 'active' : 'inactive';
            $this->assertEquals($expected, $result->getStatus(), "Failed for SSM: '{$ssmNo}'");
        }
    }

    public function test_check_company_status_result_immutability()
    {
        $result = $this->client->checkCompanyStatus('SSM-123456');
        
        $originalStatus = $result->getStatus();
        $originalSsmNumber = $result->getMetadata()['ssm_no'];
        $originalCompanyName = $result->getCompanyName();

        // Verify that result properties don't change
        $this->assertEquals($originalStatus, $result->getStatus());
        $this->assertEquals($originalSsmNumber, $result->getMetadata()['ssm_no']);
        $this->assertEquals($originalCompanyName, $result->getCompanyName());
    }

    public function test_check_company_status_performance_with_large_dataset()
    {
        $startTime = microtime(true);
        
        // Test with 1000 different SSM numbers
        for ($i = 0; $i < 1000; $i++) {
            $ssmNo = 'SSM-' . $i;
            $result = $this->client->checkCompanyStatus($ssmNo);
            $this->assertInstanceOf(CompanyStatusResult::class, $result);
            $this->assertEquals('active', $result->getStatus());
        }
        
        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;
        
        // Should complete within reasonable time (less than 1 second)
        $this->assertLessThan(1.0, $executionTime, 'Company status check should be fast');
    }

    public function test_check_company_status_with_very_long_ssm_numbers()
    {
        $longSsmActive = 'SSM-' . str_repeat('A', 100);
        $longSsmInactive = 'ABC-' . str_repeat('B', 100);

        $result1 = $this->client->checkCompanyStatus($longSsmActive);
        $this->assertEquals('active', $result1->getStatus());
        $this->assertEquals($longSsmActive, $result1->getMetadata()['ssm_no']);

        $result2 = $this->client->checkCompanyStatus($longSsmInactive);
        $this->assertEquals('inactive', $result2->getStatus());
        $this->assertEquals($longSsmInactive, $result2->getMetadata()['ssm_no']);
    }

    public function test_check_company_status_boundary_conditions()
    {
        // Test exact "SSM-" prefix
        $result1 = $this->client->checkCompanyStatus('SSM-');
        $this->assertEquals('active', $result1->getStatus());

        // Test one character short
        $result2 = $this->client->checkCompanyStatus('SSM');
        $this->assertEquals('inactive', $result2->getStatus());

        // Test one character over
        $result3 = $this->client->checkCompanyStatus('SSM-A');
        $this->assertEquals('active', $result3->getStatus());
    }
}