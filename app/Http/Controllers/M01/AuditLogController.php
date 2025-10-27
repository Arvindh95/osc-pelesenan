<?php

namespace App\Http\Controllers\M01;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditLogController extends Controller
{
    /**
     * Get audit logs for the authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $perPage = min($request->get('per_page', 10), 50); // Max 50 per page
            $page = $request->get('page', 1);

            $query = AuditLog::where('actor_id', $user->id)
                ->orderBy('created_at', 'desc');

            $auditLogs = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'logs' => $auditLogs->items(),
                'pagination' => [
                    'current_page' => $auditLogs->currentPage(),
                    'last_page' => $auditLogs->lastPage(),
                    'per_page' => $auditLogs->perPage(),
                    'total' => $auditLogs->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve audit logs.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all audit logs (admin only).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function all(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user is admin
            if ($user->role !== 'PENTADBIR_SYS') {
                return response()->json([
                    'message' => 'Access denied.',
                ], 403);
            }

            $perPage = min($request->get('per_page', 10), 50); // Max 50 per page
            $page = $request->get('page', 1);

            $query = AuditLog::with('actor')
                ->orderBy('created_at', 'desc');

            $auditLogs = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'logs' => $auditLogs->items(),
                'pagination' => [
                    'current_page' => $auditLogs->currentPage(),
                    'last_page' => $auditLogs->lastPage(),
                    'per_page' => $auditLogs->perPage(),
                    'total' => $auditLogs->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve audit logs.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}