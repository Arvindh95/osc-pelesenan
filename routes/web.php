<?php

use Illuminate\Support\Facades\Route;

// Serve the React app for all routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
