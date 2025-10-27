<?php

namespace App\Providers;

use App\Models\Company;
use App\Models\AuditLog;
use App\Policies\CompanyPolicy;
use App\Policies\AuditLogPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Company::class => CompanyPolicy::class,
        AuditLog::class => AuditLogPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define role-based gates for additional authorization checks
        Gate::define('admin-access', function ($user) {
            return $user->role === 'PENTADBIR_SYS';
        });

        Gate::define('pemohon-access', function ($user) {
            return $user->role === 'PEMOHON';
        });

        Gate::define('verified-user', function ($user) {
            return $user->status_verified_person === true;
        });
    }
}