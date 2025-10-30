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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->string('action', 100);
            $table->string('entity_type', 100);
            $table->string('entity_id', 100); // Support both integer IDs and UUIDs
            $table->json('meta')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Foreign key constraint
            $table->foreign('actor_id')->references('id')->on('users')->onDelete('set null');

            // Indexes for better query performance
            $table->index(['entity_type', 'entity_id']);
            $table->index('actor_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
