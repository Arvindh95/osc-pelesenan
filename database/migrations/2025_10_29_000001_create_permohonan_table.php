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
        Schema::create('permohonan', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('jenis_lesen_id');
            $table->enum('status', ['Draf', 'Diserahkan', 'Dibatalkan'])->default('Draf');
            $table->dateTime('tarikh_serahan')->nullable();
            $table->json('butiran_operasi')->nullable()->comment('Business details including alamat_premis');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');

            // Indexes for performance
            $table->index('user_id');
            $table->index('company_id');
            $table->index('jenis_lesen_id');
            $table->index('status');
            $table->index('tarikh_serahan');
            $table->index('created_at');
        });

        // Set engine and charset explicitly (MySQL only)
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE permohonan ENGINE = InnoDB');
            DB::statement('ALTER TABLE permohonan CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permohonan');
    }
};
