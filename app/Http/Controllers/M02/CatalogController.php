<?php

namespace App\Http\Controllers\M02;

use App\Http\Controllers\Controller;
use App\Services\M02\Module4Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * CatalogController
 * 
 * Handles requests for catalog data from Module 4
 * (License types and their requirements)
 */
class CatalogController extends Controller
{
    public function __construct(
        private Module4Client $module4Client
    ) {}

    /**
     * Get all available license types (jenis lesen)
     * 
     * @return JsonResponse
     */
    public function getJenisLesen(): JsonResponse
    {
        try {
            $jenisLesen = $this->module4Client->getJenisLesen();
            
            // Ensure the response is an array
            return response()->json($jenisLesen->toArray());
        } catch (\Exception $e) {
            Log::error('Failed to fetch jenis lesen', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'message' => 'Gagal mendapatkan senarai jenis lesen. Sila cuba sebentar lagi.',
                'error' => app()->environment('local') ? $e->getMessage() : null,
            ], 503);
        }
    }

    /**
     * Get document requirements for a specific license type
     * 
     * @param int $jenisLesenId
     * @return JsonResponse
     */
    public function getKeperluanDokumen(int $jenisLesenId): JsonResponse
    {
        try {
            $keperluan = $this->module4Client->getKeperluanDokumen($jenisLesenId);
            
            // Ensure the response is an array
            return response()->json($keperluan->toArray());
        } catch (\Exception $e) {
            Log::error('Failed to fetch keperluan dokumen', [
                'jenis_lesen_id' => $jenisLesenId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'message' => 'Gagal mendapatkan keperluan dokumen. Sila cuba sebentar lagi.',
                'error' => app()->environment('local') ? $e->getMessage() : null,
            ], 503);
        }
    }
}
