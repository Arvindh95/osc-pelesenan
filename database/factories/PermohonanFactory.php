<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Permohonan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Permohonan>
 */
class PermohonanFactory extends Factory
{
    protected $model = Permohonan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'company_id' => Company::factory(),
            'jenis_lesen_id' => fake()->numberBetween(1, 3),
            'status' => 'Draf',
            'tarikh_serahan' => null,
            'butiran_operasi' => [
                'alamat_premis' => [
                    'alamat_1' => fake()->streetAddress(),
                    'alamat_2' => fake()->optional()->secondaryAddress(),
                    'bandar' => fake()->city(),
                    'poskod' => fake()->postcode(),
                    'negeri' => fake()->randomElement(['Selangor', 'Kuala Lumpur', 'Johor', 'Penang', 'Perak']),
                ],
                'nama_perniagaan' => fake()->company(),
                'jenis_operasi' => fake()->randomElement(['Restoran', 'Kedai Runcit', 'Bengkel', 'Pejabat']),
                'bilangan_pekerja' => fake()->numberBetween(1, 50),
                'catatan' => fake()->optional()->sentence(),
            ],
        ];
    }

    /**
     * Create a draft application.
     */
    public function draf(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Draf',
            'tarikh_serahan' => null,
        ]);
    }

    /**
     * Create a submitted application.
     */
    public function diserahkan(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Diserahkan',
            'tarikh_serahan' => now(),
        ]);
    }

    /**
     * Create a cancelled application.
     */
    public function dibatalkan(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Dibatalkan',
            'tarikh_serahan' => null,
        ]);
    }

    /**
     * Create an application for a specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Create an application for a specific company.
     */
    public function forCompany(Company $company): static
    {
        return $this->state(fn (array $attributes) => [
            'company_id' => $company->id,
        ]);
    }

    /**
     * Create an application with a specific license type.
     */
    public function withJenisLesen(int $jenisLesenId): static
    {
        return $this->state(fn (array $attributes) => [
            'jenis_lesen_id' => $jenisLesenId,
        ]);
    }
}
