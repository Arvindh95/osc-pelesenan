<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Company>
 */
class CompanyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ssm_no' => $this->generateSsmNumber(),
            'name' => fake()->company() . ' ' . fake()->randomElement(['Sdn Bhd', 'Bhd', 'Enterprise', 'Trading']),
            'status' => fake()->randomElement(['active', 'inactive', 'unknown']),
            'owner_user_id' => null, // Will be set when linking to a user
        ];
    }

    /**
     * Generate a realistic SSM number.
     */
    private function generateSsmNumber(): string
    {
        // Mix of SSM- prefixed (active in mock) and regular numbers
        if (fake()->boolean(60)) {
            // 60% chance of SSM- prefix (will be active in mock verification)
            return 'SSM-' . fake()->numerify('######');
        } else {
            // 40% chance of regular number format
            return fake()->numerify('##########');
        }
    }

    /**
     * Create a company with active status.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    /**
     * Create a company with inactive status.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    /**
     * Create a company with unknown status.
     */
    public function unknown(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'unknown',
        ]);
    }

    /**
     * Create a company with SSM number that will be verified as active (starts with SSM-).
     */
    public function verifiableActive(): static
    {
        return $this->state(fn (array $attributes) => [
            'ssm_no' => 'SSM-' . fake()->numerify('######'),
            'status' => 'active',
        ]);
    }

    /**
     * Create a company with SSM number that will be verified as inactive.
     */
    public function verifiableInactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'ssm_no' => fake()->numerify('##########'),
            'status' => 'inactive',
        ]);
    }

    /**
     * Create a company owned by a specific user.
     */
    public function ownedBy(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'owner_user_id' => $user->id,
        ]);
    }

    /**
     * Create a company owned by a random user.
     */
    public function withOwner(): static
    {
        return $this->state(fn (array $attributes) => [
            'owner_user_id' => User::factory(),
        ]);
    }

    /**
     * Create an unowned company (no owner).
     */
    public function unowned(): static
    {
        return $this->state(fn (array $attributes) => [
            'owner_user_id' => null,
        ]);
    }
}