<?php

namespace App\Policies;

use App\Models\AuditLog;
use App\Models\User;

class AuditLogPolicy
{
    /**
     * Determine whether the user can view any audit logs.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'PENTADBIR_SYS';
    }

    /**
     * Determine whether the user can view the audit log.
     */
    public function view(User $user, AuditLog $auditLog): bool
    {
        // Users can view their own audit logs, admins can view all
        return $user->role === 'PENTADBIR_SYS' || $auditLog->actor_id === $user->id;
    }

    /**
     * Determine whether the user can create audit logs.
     * Generally, audit logs are created by the system, not users.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the audit log.
     * Audit logs should be immutable.
     */
    public function update(User $user, AuditLog $auditLog): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the audit log.
     * Audit logs should be immutable.
     */
    public function delete(User $user, AuditLog $auditLog): bool
    {
        return false;
    }
}