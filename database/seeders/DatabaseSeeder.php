<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Check if we're in development environment
        if (app()->environment(['local', 'development', 'testing'])) {
            // Call seeders in proper order (users first, then companies)
            $this->call([
                UserSeeder::class,
                CompanySeeder::class,
            ]);
        }

        // Keep the original test user for backward compatibility
        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
