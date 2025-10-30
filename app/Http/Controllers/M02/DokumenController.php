<?php

namespace App\Http\Controllers\M02;

use App\Http\Controllers\Controller;
use App\Http\Requests\M02\UploadDokumenRequest;
use App\Models\Permohonan;
use App\Models\PermohonanDokumen;
use App\Services\M02\DokumenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DokumenController extends Controller
{
    public function __construct(
        private DokumenService $dokumenService
    ) {
        $this->middleware(['auth:sanctum', 'feature:MODULE_M02', 'throttle:30,1']);
    }

    /**
     * Upload a document for a license application.
     *
     * @param UploadDokumenRequest $request
     * @param Permohonan $permohonan
     * @return JsonResponse
     */
    public function store(UploadDokumenRequest $request, Permohonan $permohonan): JsonResponse
    {
        try {
            // Authorize permohonan update via policy
            $this->authorize('update', $permohonan);

            $user = Auth::user();
            $validated = $request->validated();

            // Delegate to DokumenService
            $dokumen = $this->dokumenService->upload(
                permohonan: $permohonan,
                keperluanDokumenId: $validated['keperluan_dokumen_id'],
                file: $request->file('file'),
                uploader: $user
            );

            return response()->json([
                'message' => 'Document uploaded successfully.',
                'dokumen' => $dokumen,
            ], 201);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            throw $e;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Document upload failed', [
                'permohonan_id' => $permohonan->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to upload document.',
                'error' => app()->environment('local') ? $e->getMessage() : 'Ralat pelayan. Sila cuba lagi kemudian.',
            ], 500);
        }
    }

    /**
     * Delete a document from a license application.
     *
     * @param Permohonan $permohonan
     * @param PermohonanDokumen $dokumen
     * @return JsonResponse
     */
    public function destroy(Permohonan $permohonan, PermohonanDokumen $dokumen): JsonResponse
    {
        try {
            // Authorize permohonan update via policy
            $this->authorize('update', $permohonan);

            // Verify dokumen belongs to permohonan
            if ($dokumen->permohonan_id !== $permohonan->id) {
                return response()->json([
                    'message' => 'Document does not belong to this application.',
                ], 404);
            }

            $user = Auth::user();

            // Delegate to DokumenService
            $this->dokumenService->delete($dokumen, $user);

            return response()->json(null, 204);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete document.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
