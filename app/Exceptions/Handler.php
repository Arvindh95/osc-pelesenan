<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        // Handle API requests with consistent JSON responses
        if ($request->expectsJson()) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    /**
     * Handle API exceptions with consistent JSON responses.
     */
    protected function handleApiException(Request $request, Throwable $e)
    {
        if ($e instanceof ValidationException) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $e->errors(),
            ], 422);
        }

        if ($e instanceof AuthenticationException) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($e instanceof AuthorizationException) {
            return response()->json([
                'message' => 'This action is unauthorized.',
            ], 403);
        }

        if ($e instanceof NotFoundHttpException) {
            return response()->json([
                'message' => 'Not Found.',
            ], 404);
        }

        if ($e instanceof BusinessLogicException) {
            return response()->json([
                'message' => $e->getMessage(),
                'error_code' => $e->getErrorCode(),
            ], $e->getStatusCode());
        }

        if ($e instanceof ExternalServiceException) {
            return response()->json([
                'message' => 'External service temporarily unavailable.',
                'error_code' => 'EXTERNAL_SERVICE_ERROR',
            ], 503);
        }

        // Log unexpected errors
        $this->report($e);

        return response()->json([
            'message' => 'An unexpected error occurred.',
        ], 500);
    }
}