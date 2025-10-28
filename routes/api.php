<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\M01\AuthController;
use App\Http\Controllers\M01\ProfileController;
use App\Http\Controllers\M01\CompanyController;
use App\Http\Controllers\M01\AccountController;
use App\Http\Controllers\M01\AuditLogController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Module M01: Profil Pelanggan (Pendaftaran & Pembatalan)
// Authentication routes - public access with throttling
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('register', [AuthController::class, 'register'])
        ->name('register')
        ->middleware('throttle:5,1'); // 5 attempts per minute
    
    Route::post('login', [AuthController::class, 'login'])
        ->name('login')
        ->middleware('throttle:5,1'); // 5 attempts per minute
});

// Logout route - requires authentication
Route::post('auth/logout', [AuthController::class, 'logout'])
    ->name('auth.logout')
    ->middleware('auth:sanctum');

// Protected M01 routes - require authentication and feature flag
Route::middleware(['feature:MODULE_M01', 'auth:sanctum', 'active.user'])->group(function () {
    
    // Profile management routes
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::put('/', [ProfileController::class, 'update'])
        ->name('update');
        
        Route::post('verify-identity', [ProfileController::class, 'verifyIdentity'])
            ->name('verify-identity');
    });
    
    // Company management routes
    Route::prefix('company')->name('company.')->group(function () {
        Route::post('verify-ssm', [CompanyController::class, 'verifySSM'])
            ->name('verify-ssm');
        
        Route::post('link', [CompanyController::class, 'linkCompany'])
            ->name('link');
        
        Route::get('my-companies', [CompanyController::class, 'myCompanies'])
            ->name('my-companies');

        Route::get('available', [CompanyController::class, 'available'])
            ->name('available')
            ->middleware('verified');

        Route::get('all', [CompanyController::class, 'index'])
            ->name('all')
            ->middleware('can:viewAny,App\Models\Company');
    });
    
    // Account management routes
    Route::prefix('account')->name('account.')->group(function () {
        Route::post('deactivate', [AccountController::class, 'deactivate'])
            ->name('deactivate');
    });
    
    // Audit log routes
    Route::prefix('audit')->name('audit.')->group(function () {
        Route::get('logs', [AuditLogController::class, 'index'])
            ->name('logs');
        
        Route::get('all-logs', [AuditLogController::class, 'all'])
            ->name('all-logs')
            ->middleware('can:viewAny,App\Models\AuditLog');
    });
});