<?php

namespace App\Services\M01;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

class AuditService
{
    /**
     * Create an audit log entry with optional actor identification.
     *
     * @param string $action The action being performed
     * @param string $entityType The type of entity being acted upon
     * @param int $entityId The ID of the entity being acted upon
     * @param array $meta Additional metadata for the audit log
     * @param User|null $actor The user performing the action (optional, will use authenticated user if null)
     * @return AuditLog
     */
    public function log(
        string $action,
        string $entityType,
        int $entityId,
        array $meta = [],
        ?User $actor = null
    ): AuditLog {
        // Check if audit logging is enabled
        if (!config('audit.enabled', true)) {
            Log::debug('Audit logging is disabled, skipping log entry', [
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
            ]);
            
            // Return a dummy audit log for consistency
            return new AuditLog();
        }

        try {
            // Use provided actor or fall back to authenticated user
            $actorId = $actor?->id ?? Auth::id();

            // Add request metadata if available
            if (request()) {
                $meta = array_merge($meta, [
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'request_id' => request()->header('X-Request-ID'),
                ]);
            }

            $auditLog = AuditLog::create([
                'actor_id' => $actorId,
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'meta' => $meta,
            ]);

            Log::channel(config('audit.logging.channel', 'daily'))
                ->log(config('audit.logging.level', 'info'), 'Audit log created', [
                    'audit_log_id' => $auditLog->id,
                    'action' => $action,
                    'entity_type' => $entityType,
                    'entity_id' => $entityId,
                    'actor_id' => $actorId,
                ]);

            return $auditLog;
        } catch (Exception $e) {
            Log::error('Failed to create audit log entry', [
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Re-throw the exception to maintain error handling flow
            throw $e;
        }
    }

    /**
     * Create an audit log entry for a user action on a specific model.
     *
     * @param User $actor The user performing the action
     * @param string $action The action being performed
     * @param Model $entity The model instance being acted upon
     * @param array $meta Additional metadata for the audit log
     * @return AuditLog
     */
    public function logUserAction(User $actor, string $action, Model $entity, array $meta = []): AuditLog
    {
        return $this->log(
            action: $action,
            entityType: get_class($entity),
            entityId: $entity->getKey(),
            meta: $meta,
            actor: $actor
        );
    }

    /**
     * Create an audit log entry for authentication events.
     *
     * @param string $action The authentication action (e.g., 'login', 'register', 'logout')
     * @param User $user The user involved in the authentication event
     * @param array $meta Additional metadata (e.g., IP address, user agent)
     * @return AuditLog
     */
    public function logAuthEvent(string $action, User $user, array $meta = []): AuditLog
    {
        return $this->logUserAction($user, $action, $user, $meta);
    }

    /**
     * Create an audit log entry for identity verification events.
     *
     * @param User $user The user whose identity is being verified
     * @param bool $verified Whether the verification was successful
     * @param array $meta Additional metadata (e.g., IC number, verification method)
     * @return AuditLog
     */
    public function logIdentityVerification(User $user, bool $verified, array $meta = []): AuditLog
    {
        // Always log as 'identity_verification_attempted' with the result in metadata
        return $this->logUserAction($user, 'identity_verification_attempted', $user, array_merge($meta, [
            'verification_result' => $verified,
        ]));
    }

    /**
     * Create an audit log entry for company-related events.
     *
     * @param User $actor The user performing the company action
     * @param string $action The company action (e.g., 'company_verified', 'company_linked')
     * @param Model $company The company model instance
     * @param array $meta Additional metadata
     * @return AuditLog
     */
    public function logCompanyEvent(User $actor, string $action, Model $company, array $meta = []): AuditLog
    {
        return $this->logUserAction($actor, $action, $company, $meta);
    }

    /**
     * Create an audit log entry for account lifecycle events.
     *
     * @param User $user The user whose account is being modified
     * @param string $action The account action (e.g., 'account_deactivated', 'account_reactivated')
     * @param array $meta Additional metadata
     * @return AuditLog
     */
    public function logAccountEvent(User $user, string $action, array $meta = []): AuditLog
    {
        return $this->logUserAction($user, $action, $user, $meta);
    }
}