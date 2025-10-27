<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Audit Log Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration settings for the audit logging system.
    |
    */

    'enabled' => env('AUDIT_ENABLED', true),

    'retention' => [
        /*
        |--------------------------------------------------------------------------
        | Retention Period
        |--------------------------------------------------------------------------
        |
        | Number of days to retain audit logs before they are eligible for cleanup.
        | Set to 0 to disable automatic cleanup.
        |
        */
        'days' => env('AUDIT_RETENTION_DAYS', 365),

        /*
        |--------------------------------------------------------------------------
        | Auto Cleanup
        |--------------------------------------------------------------------------
        |
        | Whether to automatically schedule audit log cleanup.
        | When enabled, old logs will be cleaned up based on the retention period.
        |
        */
        'auto_cleanup' => env('AUDIT_AUTO_CLEANUP', false),
    ],

    'logging' => [
        /*
        |--------------------------------------------------------------------------
        | Log Channel
        |--------------------------------------------------------------------------
        |
        | The log channel to use for audit-related system logs.
        |
        */
        'channel' => env('AUDIT_LOG_CHANNEL', 'daily'),

        /*
        |--------------------------------------------------------------------------
        | Log Level
        |--------------------------------------------------------------------------
        |
        | The minimum log level for audit system messages.
        |
        */
        'level' => env('AUDIT_LOG_LEVEL', 'info'),
    ],

    'actions' => [
        /*
        |--------------------------------------------------------------------------
        | Tracked Actions
        |--------------------------------------------------------------------------
        |
        | List of actions that should be tracked in the audit log.
        |
        */
        'user_registered',
        'user_login',
        'user_logout',
        'identity_verification_attempted',
        'identity_verification_success',
        'identity_verification_failed',
        'company_verification_attempted',
        'company_verification_success',
        'company_verification_failed',
        'company_linked',
        'company_unlinked',
        'account_deactivated',
        'account_reactivated',
    ],
];