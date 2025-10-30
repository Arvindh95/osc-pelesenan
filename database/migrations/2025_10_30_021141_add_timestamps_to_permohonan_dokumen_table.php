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
        Schema::table('permohonan_dokumen', function (Blueprint $table) {
            // Add timestamps if they don't exist
            if (!Schema::hasColumn('permohonan_dokumen', 'created_at')) {
                $table->timestamp('created_at')->nullable()->after('uploaded_by');
            }
            if (!Schema::hasColumn('permohonan_dokumen', 'updated_at')) {
                $table->timestamp('updated_at')->nullable()->after('created_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permohonan_dokumen', function (Blueprint $table) {
            $table->dropColumn(['created_at', 'updated_at']);
        });
    }
};
