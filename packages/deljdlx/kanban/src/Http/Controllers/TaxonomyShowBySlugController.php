<?php

declare(strict_types=1);

namespace Deljdlx\Kanban\Http\Controllers;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Illuminate\Contracts\View\View;

final class TaxonomyShowBySlugController
{
    public function __invoke(string $scope, string $slug): View
    {
        $taxonomy = Taxonomy::query()
            ->where('scope', $scope)
            ->where('slug', $slug)
            ->firstOrFail();

        $taxonomy->load('terms');

        return view('kanban::taxonomy.show', [
            'title' => 'Taxonomy',
            'pageTitle' => $taxonomy->name,
            'taxonomy' => $taxonomy,
            'terms' => $taxonomy->terms,
        ]);
    }
}
