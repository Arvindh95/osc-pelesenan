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
        Schema::table('users', function (Blueprint $table) {
            // Add IC number field with unique constraint
            $table->string('ic_no', 20)->unique()->after('email');
            
            // Add identity verification status field
            $table->boolean('status_verified_person')->default(false)->after('ic_no');
            
            // Add role field with enum values
            $table->enum('role', ['PEMOHON', 'PENTADBIR_SYS'])->default('PEMOHON')->after('status_verified_person');
            
            // Add soft deletes functionality
            $table->softDeletes()->after('updated_at');
            
            // Add indexes for performance
            $table->index('ic_no');
            $table->index('role');
            $table->index('status_verified_person');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // For SQLite, we need to drop unique constraints and indexes before dropping columns
            $table->dropUnique(['ic_no']);
            $table->dropIndex(['ic_no']);
            $table->dropIndex(['role']);
            $table->dropIndex(['status_verified_person']);
            
            // Drop columns
            $table->dropColumn(['ic_no', 'status_verified_person', 'role', 'deleted_at']);
        });
    }
};
