<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;

class CompanyPolicy
{
    /**
     * Determine whether the user can view any companies.
     * Only PENTADBIR_SYS role can view all companies.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'PENTADBIR_SYS';
    }

    /**
     * Determine whether the user can view the company.
     */
    public function view(User $user, Company $company): bool
    {
        // Users can view companies they own or admins can view any
        return $user->role === 'PENTADBIR_SYS' || $company->owner_user_id === $user->id;
    }

    /**
     * Determine whether the user can link to the company.
     * Users can link to companies that have no owner or if they are admin.
     */
    public function link(User $user, Company $company): bool
    {
        // Company must not have an owner, or user must be admin
        return $company->owner_user_id === null || $user->role === 'PENTADBIR_SYS';
    }

    /**
     * Determine whether the user can update the company.
     * Only company owners or admins can update.
     */
    public function update(User $user, Company $company): bool
    {
        return $user->role === 'PENTADBIR_SYS' || $company->owner_user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the company.
     * Only admins can delete companies.
     */
    public function delete(User $user, Company $company): bool
    {
        return $user->role === 'PENTADBIR_SYS';
    }
}