<?php

namespace Database\Factories;

use App\Models\Permohonan;
use App\Models\PermohonanDokumen;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PermohonanDokumen>
 */
class PermohonanDokumenFactory extends Factory
{
    protected $model = PermohonanDokumen::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'permohonan_id' => Permohonan::factory(),
            'keperluan_dokumen_id' => fake()->numberBetween(1, 5),
            'nama_fail' => fake()->word() . '.pdf',
            'mime' => 'application/pdf',
            'saiz_bait' => fake()->numberBetween(10000, 5000000),
            'url_storan' => 'dokumen/' . fake()->uuid() . '.pdf',
            'hash_fail' => fake()->sha256(),
            'status_sah' => 'BelumSah',
            'uploaded_by' => User::factory(),
        ];
    }

    /**
     * Create a document for a specific application.
     */
    public function forPermohonan(Permohonan $permohonan): static
    {
        return $this->state(fn (array $attributes) => [
            'permohonan_id' => $permohonan->id,
        ]);
    }

    /**
     * Create a document uploaded by a specific user.
     */
    public function uploadedBy(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'uploaded_by' => $user->id,
        ]);
    }

    /**
     * Create a validated document.
     */
    public function disahkan(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_sah' => 'Disahkan',
        ]);
    }

    /**
     * Create a PDF document.
     */
    public function pdf(): static
    {
        return $this->state(fn (array $attributes) => [
            'nama_fail' => fake()->word() . '.pdf',
            'mime' => 'application/pdf',
        ]);
    }

    /**
     * Create a JPG document.
     */
    public function jpg(): static
    {
        return $this->state(fn (array $attributes) => [
            'nama_fail' => fake()->word() . '.jpg',
            'mime' => 'image/jpeg',
        ]);
    }
}
