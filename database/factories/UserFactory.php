<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'ic_no' => $this->generateIcNumber(),
            'status_verified_person' => fake()->boolean(30), // 30% chance of being verified
            'role' => fake()->randomElement(['PEMOHON', 'PENTADBIR_SYS']),
        ];
    }

    /**
     * Generate a realistic Malaysian IC number (12 digits).
     */
    private function generateIcNumber(): string
    {
        // Generate YYMMDD format for birth date
        $year = fake()->numberBetween(70, 99); // Birth years 1970-1999
        $month = str_pad(fake()->numberBetween(1, 12), 2, '0', STR_PAD_LEFT);
        $day = str_pad(fake()->numberBetween(1, 28), 2, '0', STR_PAD_LEFT);
        
        // Generate place of birth code (2 digits)
        $placeCode = str_pad(fake()->numberBetween(1, 99), 2, '0', STR_PAD_LEFT);
        
        // Generate running number (4 digits)
        $runningNumber = str_pad(fake()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT);
        
        return $year . $month . $day . $placeCode . $runningNumber;
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create a verified person.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_verified_person' => true,
        ]);
    }

    /**
     * Create an unverified person.
     */
    public function unverifiedPerson(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_verified_person' => false,
        ]);
    }

    /**
     * Create a user with PEMOHON role.
     */
    public function pemohon(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'PEMOHON',
        ]);
    }

    /**
     * Create a user with PENTADBIR_SYS role.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'PENTADBIR_SYS',
        ]);
    }

    /**
     * Create a user with IC number ending in even digit (for mock verification success).
     */
    public function verifiableIc(): static
    {
        return $this->state(function (array $attributes) {
            $icNo = $this->generateIcNumber();
            // Ensure IC ends with even digit for mock verification success
            $icNo = substr($icNo, 0, -1) . fake()->randomElement(['0', '2', '4', '6', '8']);
            
            return [
                'ic_no' => $icNo,
            ];
        });
    }

    /**
     * Create a user with IC number ending in odd digit (for mock verification failure).
     */
    public function unverifiableIc(): static
    {
        return $this->state(function (array $attributes) {
            $icNo = $this->generateIcNumber();
            // Ensure IC ends with odd digit for mock verification failure
            $icNo = substr($icNo, 0, -1) . fake()->randomElement(['1', '3', '5', '7', '9']);
            
            return [
                'ic_no' => $icNo,
            ];
        });
    }
}
