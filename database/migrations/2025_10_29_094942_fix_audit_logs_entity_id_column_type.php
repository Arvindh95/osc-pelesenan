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
        Schema::table('audit_logs', function (Blueprint $table) {
            // Change entity_id from bigint unsigned to string(100) to support UUIDs
            $table->string('entity_id', 100)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            // Revert entity_id back to bigint unsigned
            $table->unsignedBigInteger('entity_id')->change();
        });
    }
};
