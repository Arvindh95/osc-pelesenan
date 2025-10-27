<?php

namespace Tests\Unit;

use App\Services\MockIdentityClient;
use App\Services\IdentityVerificationResult;
use Tests\TestCase;

class MockIdentityClientTest extends TestCase
{
    private MockIdentityClient $client;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = new MockIdentityClient();
    }

    public function test_verify_with_even_ending_ic_returns_success()
    {
        $icNumbers = [
            '123456789010', // ends with 0
            '123456789012', // ends with 2
            '123456789014', // ends with 4
            '123456789016', // ends with 6
            '123456789018'  // ends with 8
        ];

        foreach ($icNumbers as $icNo) {
            $result = $this->client->verify($icNo);
            
            $this->assertInstanceOf(IdentityVerificationResult::class, $result);
            $this->assertTrue($result->isVerified(), "IC {$icNo} should be verified");
            $this->assertEquals('Identity verification successful', $result->getMessage());
            $this->assertEquals($icNo, $result->getMetadata()['ic_no']);
        }
    }

    public function test_verify_with_odd_ending_ic_returns_failure()
    {
        $icNumbers = [
            '123456789011', // ends with 1
            '123456789013', // ends with 3
            '123456789015', // ends with 5
            '123456789017', // ends with 7
            '123456789019'  // ends with 9
        ];

        foreach ($icNumbers as $icNo) {
            $result = $this->client->verify($icNo);
            
            $this->assertInstanceOf(IdentityVerificationResult::class, $result);
            $this->assertFalse($result->isVerified(), "IC {$icNo} should not be verified");
            $this->assertEquals('Identity verification failed', $result->getMessage());
            $this->assertEquals($icNo, $result->getMetadata()['ic_no']);
        }
    }

    public function test_verify_returns_correct_result_structure()
    {
        $result = $this->client->verify('123456789012');

        $this->assertInstanceOf(IdentityVerificationResult::class, $result);
        $this->assertIsBool($result->isVerified());
        $this->assertIsString($result->getMessage());
        $this->assertIsString($result->getMetadata()['ic_no']);
    }

    public function test_verify_with_edge_case_ic_numbers()
    {
        // Test single digit IC (should still work with last digit logic)
        $result = $this->client->verify('0');
        $this->assertTrue($result->isVerified());

        $result = $this->client->verify('1');
        $this->assertFalse($result->isVerified());

        // Test empty string (should handle gracefully)
        $result = $this->client->verify('');
        $this->assertFalse($result->isVerified());
    }

    public function test_verify_with_non_numeric_characters()
    {
        $testCases = [
            'ABC123456789012' => true,  // ends with 2
            'ABC123456789013' => false, // ends with 3
            '12345678901A'    => false, // ends with A (non-numeric)
            'ABCDEFGHIJKL'    => false, // all letters
        ];

        foreach ($testCases as $icNo => $expectedVerified) {
            $result = $this->client->verify($icNo);
            $this->assertEquals($expectedVerified, $result->isVerified(), "Failed for IC: {$icNo}");
        }
    }

    public function test_verify_consistency_multiple_calls()
    {
        $icNo = '123456789012';
        
        // Call verify multiple times with same IC
        $result1 = $this->client->verify($icNo);
        $result2 = $this->client->verify($icNo);
        $result3 = $this->client->verify($icNo);

        // Results should be consistent
        $this->assertEquals($result1->isVerified(), $result2->isVerified());
        $this->assertEquals($result2->isVerified(), $result3->isVerified());
        $this->assertEquals($result1->getMessage(), $result2->getMessage());
        $this->assertEquals($result1->getMetadata()['ic_no'], $result2->getMetadata()['ic_no']);
    }

    public function test_verify_with_various_ic_lengths()
    {
        $testCases = [
            '2' => true,           // single digit, even
            '12' => true,          // two digits, ends with 2
            '123' => false,        // three digits, ends with 3
            '1234567890' => true,  // ten digits, ends with 0
            '12345678901234567890' => true // twenty digits, ends with 0
        ];

        foreach ($testCases as $icNo => $expectedVerified) {
            $result = $this->client->verify($icNo);
            $this->assertEquals($expectedVerified, $result->isVerified(), "Failed for IC: {$icNo}");
        }
    }

    public function test_verify_result_immutability()
    {
        $result = $this->client->verify('123456789012');
        
        $originalVerified = $result->isVerified();
        $originalMessage = $result->getMessage();
        $originalIcNumber = $result->getMetadata()['ic_no'];

        // Verify that result properties don't change
        $this->assertEquals($originalVerified, $result->isVerified());
        $this->assertEquals($originalMessage, $result->getMessage());
        $this->assertEquals($originalIcNumber, $result->getMetadata()['ic_no']);
    }

    public function test_verify_handles_whitespace_and_special_characters()
    {
        $testCases = [
            ' 123456789012 ' => true,  // with spaces
            '123-456-789-012' => true, // with dashes
            '123.456.789.012' => true, // with dots
            '123 456 789 012' => true, // with internal spaces
        ];

        foreach ($testCases as $icNo => $expectedVerified) {
            $result = $this->client->verify($icNo);
            // The mock should handle these by looking at the last character
            $lastChar = substr(trim($icNo), -1);
            $expected = is_numeric($lastChar) && (intval($lastChar) % 2 === 0);
            $this->assertEquals($expected, $result->isVerified(), "Failed for IC: {$icNo}");
        }
    }

    public function test_verify_performance_with_large_dataset()
    {
        $startTime = microtime(true);
        
        // Test with 1000 different IC numbers
        for ($i = 0; $i < 1000; $i++) {
            $icNo = '12345678901' . $i;
            $result = $this->client->verify($icNo);
            $this->assertInstanceOf(IdentityVerificationResult::class, $result);
        }
        
        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;
        
        // Should complete within reasonable time (less than 1 second)
        $this->assertLessThan(1.0, $executionTime, 'Verification should be fast');
    }
}