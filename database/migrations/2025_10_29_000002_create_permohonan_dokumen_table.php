<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('permohonan_dokumen', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('permohonan_id', 36);
            $table->unsignedBigInteger('keperluan_dokumen_id')->comment('From Module 4');
            $table->string('nama_fail', 255);
            $table->string('mime', 100);
            $table->unsignedBigInteger('saiz_bait');
            $table->string('url_storan', 500);
            $table->string('hash_fail', 128)->nullable()->comment('Optional integrity hash (SHA-256)');
            $table->enum('status_sah', ['BelumSah', 'Disahkan'])->default('BelumSah');
            $table->unsignedBigInteger('uploaded_by');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('permohonan_id')->references('id')->on('permohonan')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('restrict');

            // Unique constraint to prevent duplicate uploads for same requirement
            $table->unique(['permohonan_id', 'keperluan_dokumen_id'], 'unique_keperluan_per_permohonan');

            // Indexes for performance
            $table->index('permohonan_id');
            $table->index('keperluan_dokumen_id');
            $table->index('status_sah');
        });

        // Set engine and charset explicitly (MySQL only)
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE permohonan_dokumen ENGINE = InnoDB');
            DB::statement('ALTER TABLE permohonan_dokumen CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permohonan_dokumen');
    }
};
