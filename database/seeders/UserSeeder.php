<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user with PENTADBIR_SYS role
        User::factory()->create([
            'name' => 'System Administrator',
            'email' => 'admin@osc-pelesenan.gov.my',
            'password' => Hash::make('admin123'),
            'ic_no' => '850101014567', // Even ending for verification success
            'status_verified_person' => true,
            'role' => 'PENTADBIR_SYS',
            'email_verified_at' => now(),
        ]);

        // Create verified PEMOHON user
        User::factory()->create([
            'name' => 'Ahmad Verified',
            'email' => 'ahmad.verified@example.com',
            'password' => Hash::make('password'),
            'ic_no' => '900215031234', // Even ending for verification success
            'status_verified_person' => true,
            'role' => 'PEMOHON',
            'email_verified_at' => now(),
        ]);

        // Create unverified PEMOHON user
        User::factory()->create([
            'name' => 'Siti Unverified',
            'email' => 'siti.unverified@example.com',
            'password' => Hash::make('password'),
            'ic_no' => '920308051235', // Odd ending for verification failure
            'status_verified_person' => false,
            'role' => 'PEMOHON',
            'email_verified_at' => now(),
        ]);

        // Create PEMOHON user with verifiable IC (even ending)
        User::factory()->create([
            'name' => 'Rahman Verifiable',
            'email' => 'rahman.verifiable@example.com',
            'password' => Hash::make('password'),
            'ic_no' => '880722071456', // Even ending for verification success
            'status_verified_person' => false, // Not yet verified
            'role' => 'PEMOHON',
            'email_verified_at' => now(),
        ]);

        // Create PEMOHON user with unverifiable IC (odd ending)
        User::factory()->create([
            'name' => 'Fatimah Unverifiable',
            'email' => 'fatimah.unverifiable@example.com',
            'password' => Hash::make('password'),
            'ic_no' => '950412081237', // Odd ending for verification failure
            'status_verified_person' => false,
            'role' => 'PEMOHON',
            'email_verified_at' => now(),
        ]);

        // Create additional sample PEMOHON users with various states
        User::factory()->pemohon()->verified()->count(3)->create();
        User::factory()->pemohon()->unverifiedPerson()->verifiableIc()->count(2)->create();
        User::factory()->pemohon()->unverifiedPerson()->unverifiableIc()->count(2)->create();
    }
}