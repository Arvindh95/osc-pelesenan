<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckVerifiedUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$user->status_verified_person) {
            return response()->json([
                'message' => 'Anda perlu mengesahkan identiti anda terlebih dahulu untuk mengakses ciri ini.',
            ], 403);
        }

        return $next($request);
    }
}
