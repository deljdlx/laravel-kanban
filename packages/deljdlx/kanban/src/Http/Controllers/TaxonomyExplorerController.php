<?php

declare(strict_types=1);

namespace Deljdlx\Kanban\Http\Controllers;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

/**
 * Display a Tabler-based explorer for taxonomies and their terms.
 */
final class TaxonomyExplorerController
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): View
    {
        $scope = (string) ($request->query('scope') ?? 'global');
        $q = trim((string) ($request->query('q') ?? ''));
        $selectedSlug = trim((string) ($request->query('slug') ?? ''));

        $scopes = Taxonomy::query()
            ->select('scope')
            ->distinct()
            ->orderBy('scope')
            ->pluck('scope')
            ->filter()
            ->values()
            ->all();
        if (empty($scopes)) {
            $scopes = ['global'];
        }

        $taxonomiesQuery = Taxonomy::query()
            ->where('scope', $scope)
            ->orderBy('name');

        if ($q !== '') {
            $taxonomiesQuery->where(static function ($qb) use ($q): void {
                $qb->where('name', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            });
        }

        $taxonomies = $taxonomiesQuery->get();

        // Determine selected taxonomy (default to first when none provided)
        $selectedTaxonomy = null;
        $selectedTerms = collect();
        if ($taxonomies->isNotEmpty()) {
            if ($selectedSlug === '') {
                $selectedTaxonomy = $taxonomies->first();
                $selectedSlug = $selectedTaxonomy?->slug ?? '';
            } else {
                $selectedTaxonomy = $taxonomies->firstWhere('slug', $selectedSlug);
            }

            if ($selectedTaxonomy) {
                $selectedTerms = Term::query()
                    ->where('taxonomy_id', $selectedTaxonomy->id)
                    ->orderBy('path')
                    ->get();
            }
        }

        $data = [
            'title' => 'Taxonomies',
            'pageTitle' => 'Taxonomies Explorer',
            'scope' => $scope,
            'scopes' => $scopes,
            'q' => $q,
            'taxonomies' => $taxonomies,
            'selectedSlug' => $selectedSlug,
            'selectedTaxonomy' => $selectedTaxonomy,
            'selectedTerms' => $selectedTerms,
        ];

        // If requesting only the details fragment (AJAX), return the partial view
        if ($request->query('fragment') === 'details') {
            return view('kanban::taxonomy.partials.explorer-detail', $data);
        }

        return view('kanban::taxonomy.explorer', $data);
    }
}
