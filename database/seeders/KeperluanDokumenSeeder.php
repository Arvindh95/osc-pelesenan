<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KeperluanDokumenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Note: This seeder is for development purposes only.
     * In production, document requirements are managed by Module 4.
     */
    public function run(): void
    {
        // Only run in non-production environments
        if (app()->environment('production')) {
            $this->command->warn('KeperluanDokumenSeeder skipped in production environment');
            return;
        }

        // Check if table exists
        if (!DB::getSchemaBuilder()->hasTable('keperluan_dokumen')) {
            $this->command->warn('Table keperluan_dokumen does not exist. Skipping KeperluanDokumenSeeder.');
            return;
        }

        // Clear existing data in development
        DB::table('keperluan_dokumen')->truncate();

        // Create sample document requirements linked to jenis_lesen
        DB::table('keperluan_dokumen')->insert([
            // Requirements for Lesen Perniagaan (jenis_lesen_id = 1)
            [
                'id' => 1,
                'jenis_lesen_id' => 1,
                'nama' => 'Salinan Pendaftaran SSM',
                'keterangan' => 'Salinan sijil pendaftaran perniagaan dari SSM',
                'wajib' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'jenis_lesen_id' => 1,
                'nama' => 'Gambar Premis Perniagaan',
                'keterangan' => 'Gambar bahagian depan dan dalam premis',
                'wajib' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'jenis_lesen_id' => 1,
                'nama' => 'Pelan Susun Atur Premis',
                'keterangan' => 'Pelan susun atur premis perniagaan',
                'wajib' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Requirements for Lesen Premis Makanan (jenis_lesen_id = 2)
            [
                'id' => 4,
                'jenis_lesen_id' => 2,
                'nama' => 'Sijil Kursus Pengendalian Makanan',
                'keterangan' => 'Sijil kursus pengendalian makanan yang sah',
                'wajib' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'jenis_lesen_id' => 2,
                'nama' => 'Salinan Pendaftaran SSM',
                'keterangan' => 'Salinan sijil pendaftaran perniagaan dari SSM',
                'wajib' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'jenis_lesen_id' => 2,
                'nama' => 'Gambar Premis Makanan',
                'keterangan' => 'Gambar dapur dan kawasan penyediaan makanan',
                'wajib' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 7,
                'jenis_lesen_id' => 2,
                'nama' => 'Pelan Lantai Premis',
                'keterangan' => 'Pelan lantai premis makanan',
                'wajib' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Requirements for Lesen Tempat Hiburan (jenis_lesen_id = 3)
            [
                'id' => 8,
                'jenis_lesen_id' => 3,
                'nama' => 'Salinan Pendaftaran SSM',
                'keterangan' => 'Salinan sijil pendaftaran perniagaan dari SSM',
                'wajib' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 9,
                'jenis_lesen_id' => 3,
                'nama' => 'Sijil Keselamatan Bomba',
                'keterangan' => 'Sijil kelulusan keselamatan dari Jabatan Bomba',
                'wajib' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 10,
                'jenis_lesen_id' => 3,
                'nama' => 'Pelan Bangunan',
                'keterangan' => 'Pelan bangunan yang diluluskan',
                'wajib' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 11,
                'jenis_lesen_id' => 3,
                'nama' => 'Gambar Premis',
                'keterangan' => 'Gambar premis hiburan',
                'wajib' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->command->info('Sample keperluan_dokumen records created successfully');
    }
}
