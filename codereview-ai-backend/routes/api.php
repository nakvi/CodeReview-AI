<?php

// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CodeReviewController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| No authentication required - simple public API
*/

// Code Review routes (all public, no authentication)
Route::prefix('reviews')->group(function () {
    Route::get('/', [CodeReviewController::class, 'index']); // Get reviews by user_name
    Route::post('/', [CodeReviewController::class, 'store']); // Submit new code
    Route::get('/{codeReview}', [CodeReviewController::class, 'show']); // Get single review
    Route::delete('/{codeReview}', [CodeReviewController::class, 'destroy']); // Delete review
});

// Statistics route
Route::get('stats', [CodeReviewController::class, 'stats']); // Get user stats

// Health check endpoint
Route::get('health', function () {
    return response()->json([
        'status' => 'OK',
        'timestamp' => now()->toIso8601String(),
        'service' => 'CodeReview AI API',
    ]);
});