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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('ssm_no', 50)->unique();
            $table->string('name');
            $table->enum('status', ['active', 'inactive', 'unknown'])->default('unknown');
            $table->unsignedBigInteger('owner_user_id')->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('owner_user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
