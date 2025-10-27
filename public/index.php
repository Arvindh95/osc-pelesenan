<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Allow all sources for development
if (str_contains(($_SERVER['HTTP_HOST'] ?? ''), '127.0.0.1') || env('APP_ENV') === 'local') {
    header("Content-Security-Policy: default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__ . '/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__ . '/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__ . '/../bootstrap/app.php';

$app->handleRequest(Request::capture());
