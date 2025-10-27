<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some users to link companies to
        $verifiedUser = User::where('email', 'ahmad.verified@example.com')->first();
        $unverifiedUser = User::where('email', 'siti.unverified@example.com')->first();
        $verifiableUser = User::where('email', 'rahman.verifiable@example.com')->first();

        // Create active companies with SSM- prefix (will verify as active)
        Company::factory()->create([
            'ssm_no' => 'SSM-123456',
            'name' => 'Tech Solutions Sdn Bhd',
            'status' => 'active',
            'owner_user_id' => $verifiedUser?->id,
        ]);

        Company::factory()->create([
            'ssm_no' => 'SSM-789012',
            'name' => 'Digital Services Enterprise',
            'status' => 'active',
            'owner_user_id' => null, // Unowned, available for linking
        ]);

        Company::factory()->create([
            'ssm_no' => 'SSM-345678',
            'name' => 'Innovation Hub Bhd',
            'status' => 'active',
            'owner_user_id' => null, // Unowned, available for linking
        ]);

        // Create inactive companies (regular SSM numbers)
        Company::factory()->create([
            'ssm_no' => '1234567890',
            'name' => 'Old Trading Company',
            'status' => 'inactive',
            'owner_user_id' => $unverifiedUser?->id,
        ]);

        Company::factory()->create([
            'ssm_no' => '9876543210',
            'name' => 'Legacy Business Sdn Bhd',
            'status' => 'inactive',
            'owner_user_id' => null,
        ]);

        // Create companies with unknown status
        Company::factory()->create([
            'ssm_no' => '5555555555',
            'name' => 'Mystery Corporation',
            'status' => 'unknown',
            'owner_user_id' => null,
        ]);

        Company::factory()->create([
            'ssm_no' => '1111111111',
            'name' => 'Pending Verification Sdn Bhd',
            'status' => 'unknown',
            'owner_user_id' => $verifiableUser?->id,
        ]);

        // Create additional companies using factory states
        Company::factory()->verifiableActive()->unowned()->count(3)->create();
        Company::factory()->verifiableInactive()->unowned()->count(2)->create();
        Company::factory()->unknown()->unowned()->count(2)->create();

        // Create some companies owned by random existing users
        $existingUsers = User::where('role', 'PEMOHON')->take(3)->get();
        foreach ($existingUsers as $user) {
            Company::factory()->verifiableActive()->create([
                'owner_user_id' => $user->id,
            ]);
        }
    }
}