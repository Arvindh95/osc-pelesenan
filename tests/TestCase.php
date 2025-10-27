<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Set MODULE_M01 to true for testing
        config(['features.MODULE_M01' => true]);
        
        // Run seeders for consistent test data
        $this->seed();
    }

    /**
     * Create a test user with specified attributes
     */
    protected function createUser(array $attributes = []): \App\Models\User
    {
        return \App\Models\User::factory()->create($attributes);
    }

    /**
     * Create a test company with specified attributes
     */
    protected function createCompany(array $attributes = []): \App\Models\Company
    {
        return \App\Models\Company::factory()->create($attributes);
    }

    /**
     * Authenticate a user and return the token
     */
    protected function actingAsUser(\App\Models\User $user): string
    {
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeaders(['Authorization' => 'Bearer ' . $token]);
        return $token;
    }
}
