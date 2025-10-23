<?php

declare(strict_types=1);

use Deljdlx\Taxonomy\Models\TaxonomyDemoContent;
use Illuminate\Support\Facades\Route;

Route::get('/taxonomy/demo-contents', function () {
    $contents = TaxonomyDemoContent::query()
        ->with(['terms' => function ($q) { $q->with('taxonomy'); }])
        ->latest('id')
        ->limit(100)
        ->get();

    return view('taxonomy::demo.contents', [
        'contents' => $contents,
    ]);
})->name('taxonomy.demo.contents');
