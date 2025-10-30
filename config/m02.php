<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Module M02 Feature Flag
    |--------------------------------------------------------------------------
    |
    | Controls whether Module M02 (Permohonan Lesen oleh Pemohon) is enabled.
    | When disabled, all M02 endpoints will return a feature disabled error.
    |
    */
    'enabled' => env('MODULE_M02', false),

    /*
    |--------------------------------------------------------------------------
    | Module 4 Integration Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for integrating with Module 4 (License Catalog Service).
    | Module 4 provides jenis_lesen (license types) and keperluan_dokumen
    | (document requirements) data.
    |
    */
    'module4' => [
        'base_url' => env('MODULE_4_BASE_URL', 'http://localhost:8004/api'),
        'cache_ttl' => env('MODULE_4_CACHE_TTL', 900), // 15 minutes in seconds
        'timeout' => env('MODULE_4_TIMEOUT', 10), // HTTP request timeout in seconds
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for document uploads in license applications.
    |
    */
    'files' => [
        // Filesystem disk to use for storing uploaded documents
        'disk' => env('FILESYSTEM_DISK', 'local'),

        // Maximum upload size in bytes (default: 10 MB)
        'max_upload_size' => env('MAX_UPLOAD_SIZE', 10 * 1024 * 1024),

        // Allowed MIME types for document uploads
        'allowed_mimes' => ['pdf', 'jpg', 'jpeg', 'png'],

        // Enable SHA-256 hash computation for file integrity verification
        'integrity_hash_enabled' => env('FILE_INTEGRITY_HASH_ENABLED', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Antivirus Scanning Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for optional antivirus scanning of uploaded documents.
    | When enabled, uploaded documents are queued for AV scanning.
    |
    */
    'antivirus' => [
        // Enable or disable antivirus scanning
        'enabled' => env('AV_SCAN_ENABLED', false),

        // Queue name for antivirus scan jobs
        'queue' => env('AV_SCAN_QUEUE', 'av-scans'),

        // Job timeout in seconds
        'timeout' => env('AV_SCAN_TIMEOUT', 300), // 5 minutes
    ],

    /*
    |--------------------------------------------------------------------------
    | Module 5 Integration Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for integrating with Module 5 (PBT Review Queue).
    | Module 5 receives submitted applications for PBT review.
    |
    */
    'module5' => [
        'base_url' => env('MODULE_5_BASE_URL', 'http://localhost:8005'),
        'timeout' => env('MODULE_5_TIMEOUT', 10), // HTTP request timeout in seconds
    ],

    /*
    |--------------------------------------------------------------------------
    | Module 12 Integration Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for integrating with Module 12 (Notification Service).
    | Module 12 sends email/SMS notifications to users.
    |
    */
    'module12' => [
        'base_url' => env('MODULE_12_BASE_URL', 'http://localhost:8012'),
        'timeout' => env('MODULE_12_TIMEOUT', 10), // HTTP request timeout in seconds
    ],
];
