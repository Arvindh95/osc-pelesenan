<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JenisLesenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Note: This seeder is for development purposes only.
     * In production, license catalog data is managed by Module 4.
     */
    public function run(): void
    {
        // Only run in non-production environments
        if (app()->environment('production')) {
            $this->command->warn('JenisLesenSeeder skipped in production environment');
            return;
        }

        // Check if table exists
        if (!DB::getSchemaBuilder()->hasTable('jenis_lesen')) {
            $this->command->warn('Table jenis_lesen does not exist. Skipping JenisLesenSeeder.');
            return;
        }

        // Clear existing data in development
        DB::table('jenis_lesen')->truncate();

        // Create sample license types
        DB::table('jenis_lesen')->insert([
            [
                'id' => 1,
                'kod' => 'LESEN-PERNIAGAAN',
                'nama' => 'Lesen Perniagaan',
                'keterangan' => 'Lesen untuk menjalankan perniagaan am',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'kod' => 'LESEN-MAKANAN',
                'nama' => 'Lesen Premis Makanan',
                'keterangan' => 'Lesen untuk menjalankan premis penyediaan makanan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'kod' => 'LESEN-HIBURAN',
                'nama' => 'Lesen Tempat Hiburan',
                'keterangan' => 'Lesen untuk menjalankan tempat hiburan awam',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->command->info('Sample jenis_lesen records created successfully');
    }
}
