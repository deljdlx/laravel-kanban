<?php

declare(strict_types=1);

use Deljdlx\Taxonomy\Http\Controllers\TaxonomyController;
use Deljdlx\Taxonomy\Http\Controllers\TermController;
use Deljdlx\Taxonomy\Http\Controllers\TermMoveController;
use Deljdlx\Taxonomy\Http\Controllers\TermableController;
use Illuminate\Support\Facades\Route;

$prefix = rtrim(config('taxonomy.route_prefix', 'app/api'), '/');

Route::middleware('api')
    ->prefix($prefix)
    ->group(function (): void {
    Route::get('taxonomies/check-slug', [TaxonomyController::class, 'checkSlug']);
    Route::apiResource('taxonomies', TaxonomyController::class);
        Route::get('taxonomies/{taxonomy}/terms', [TermController::class, 'index']);
        Route::post('taxonomies/{taxonomy}/terms', [TermController::class, 'store']);
    Route::get('taxonomies/{taxonomy}/terms/check-slug', [TermController::class, 'checkSlug']);
        Route::apiResource('terms', TermController::class)->only(['show', 'update', 'destroy']);
        Route::post('terms/{term}/move', TermMoveController::class)->name('terms.move');
        Route::post('termables/attach', [TermableController::class, 'attach']);
        Route::post('termables/detach', [TermableController::class, 'detach']);
        Route::post('termables/sync', [TermableController::class, 'sync']);
    });
