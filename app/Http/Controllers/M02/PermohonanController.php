<?php

namespace App\Http\Controllers\M02;

use App\Http\Controllers\Controller;
use App\Http\Requests\M02\CreatePermohonanRequest;
use App\Http\Requests\M02\UpdatePermohonanRequest;
use App\Models\Permohonan;
use App\Services\M02\PermohonanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PermohonanController extends Controller
{
    public function __construct(
        private PermohonanService $permohonanService
    ) {
        $this->middleware(['auth:sanctum', 'feature:MODULE_M02', 'throttle:60,1']);
    }

    /**
     * List user's applications with filters and pagination.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Build query for user's applications
            $query = Permohonan::forUser($user->id)->with('company');

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->input('status'));
            }

            if ($request->has('jenis_lesen_id')) {
                $query->where('jenis_lesen_id', $request->input('jenis_lesen_id'));
            }

            if ($request->has('tarikh_dari')) {
                $query->where('tarikh_serahan', '>=', $request->input('tarikh_dari'));
            }

            if ($request->has('tarikh_hingga')) {
                $query->where('tarikh_serahan', '<=', $request->input('tarikh_hingga'));
            }

            // Default sort by created_at DESC
            $query->orderBy('created_at', 'desc');

            // Paginate results (default 15, max 100 per page)
            $perPage = min((int) $request->input('per_page', 15), 100);
            $paginator = $query->paginate($perPage);

            // Transform to match frontend expectations
            return response()->json([
                'data' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve applications.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new draft application.
     *
     * @param CreatePermohonanRequest $request
     * @return JsonResponse
     */
    public function store(CreatePermohonanRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $permohonan = $this->permohonanService->createDraft($user, $request->validated());

            return response()->json([
                'message' => 'Draft application created successfully.',
                'permohonan' => $permohonan->load(['company', 'dokumen']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create application.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * View application details.
     *
     * @param Permohonan $permohonan
     * @return JsonResponse
     */
    public function show(Permohonan $permohonan): JsonResponse
    {
        try {
            // Authorize via policy
            $this->authorize('view', $permohonan);

            // Eager load relationships
            $permohonan->load(['dokumen', 'company']);

            return response()->json([
                'permohonan' => $permohonan,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve application.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update draft application.
     *
     * @param UpdatePermohonanRequest $request
     * @param Permohonan $permohonan
     * @return JsonResponse
     */
    public function update(UpdatePermohonanRequest $request, Permohonan $permohonan): JsonResponse
    {
        try {
            // Authorize via policy
            $this->authorize('update', $permohonan);

            $user = Auth::user();
            $permohonan = $this->permohonanService->updateDraft($permohonan, $user, $request->validated());

            return response()->json([
                'message' => 'Application updated successfully.',
                'permohonan' => $permohonan->load(['company', 'dokumen']),
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update application.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Submit application to PBT.
     *
     * @param Permohonan $permohonan
     * @return JsonResponse
     */
    public function submit(Permohonan $permohonan): JsonResponse
    {
        try {
            // Authorize via policy
            $this->authorize('submit', $permohonan);

            $user = Auth::user();
            $permohonan = $this->permohonanService->submit($permohonan, $user);

            return response()->json([
                'message' => 'Permohonan berjaya diserahkan',
                'permohonan' => $permohonan,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            throw $e;
        } catch (\App\Exceptions\M02\PermohonanException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit application.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel draft application.
     *
     * @param Request $request
     * @param Permohonan $permohonan
     * @return JsonResponse
     */
    public function cancel(Request $request, Permohonan $permohonan): JsonResponse
    {
        try {
            // Authorize via policy
            $this->authorize('cancel', $permohonan);

            // Validate reason in request
            $request->validate([
                'reason' => 'required|string|max:500',
            ]);

            $user = Auth::user();
            $permohonan = $this->permohonanService->cancel($permohonan, $user, $request->input('reason'));

            return response()->json([
                'message' => 'Permohonan berjaya dibatalkan',
                'permohonan' => $permohonan,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            throw $e;
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to cancel application.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
