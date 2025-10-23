<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Http\Controllers;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class TaxonomyController extends Controller
{
    public function checkSlug(Request $request): JsonResponse
    {
        $data = $request->validate([
            'slug' => ['nullable','string','max:255'],
            'name' => ['nullable','string','max:255'],
            'scope' => ['nullable','string','max:255'],
        ]);
        $slug = trim((string) ($data['slug'] ?? ''));
        if ($slug === '' && !empty($data['name'])) {
            $slug = str($data['name'])->slug()->value();
        }
        if ($slug === '') {
            return response()->json(['available' => false, 'slug' => ''], 200);
        }
        $exists = Taxonomy::query()
            ->where('slug', $slug)
            ->when($request->filled('scope'), fn($q) => $q->where('scope', $request->string('scope')->toString()))
            ->exists();
        return response()->json(['available' => ! $exists, 'slug' => $slug], 200);
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->integer('per_page', 15), 1), 100);
        $paginator = QueryBuilder::for(Taxonomy::query())
            ->allowedFilters([
                AllowedFilter::exact('id'),
                'name', 'slug', 'scope',
            ])
            ->allowedSorts(['id','name','slug','scope'])
            ->defaultSort('id')
            ->paginate($perPage)
            ->appends($request->query());

        return response()->json($paginator);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'slug' => ['nullable','string','max:255'],
            'scope' => ['nullable','string','max:255'],
            'hierarchical' => ['boolean'],
            'color' => ['nullable','string','max:64'],
            'icon' => ['nullable','string','max:64'],
            'description' => ['nullable','string'],
        ]);
        $data['slug'] = $data['slug'] ?? str($data['name'])->slug()->value();
        // Enforce uniqueness per scope (scope, slug)
        $exists = Taxonomy::query()
            ->where('slug', $data['slug'])
            ->where('scope', $data['scope'])
            ->exists();
        if ($exists) {
            return response()->json([
                'message' => 'Ce slug est déjà utilisé pour ce scope.',
                'errors' => ['slug' => ['Ce slug est déjà utilisé pour ce scope.']],
            ], 422);
        }
        $taxonomy = Taxonomy::create($data);
        return response()->json($taxonomy, 201);
    }

    public function show(Taxonomy $taxonomy): JsonResponse
    {
        return response()->json($taxonomy);
    }

    public function update(Request $request, Taxonomy $taxonomy): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes','string','max:255'],
            'slug' => ['sometimes','string','max:255'],
            'scope' => ['sometimes','nullable','string','max:255'],
            'hierarchical' => ['sometimes','boolean'],
            'color' => ['sometimes','nullable','string','max:64'],
            'icon' => ['sometimes','nullable','string','max:64'],
            'description' => ['sometimes','nullable','string'],
        ]);
        if (array_key_exists('name', $data) && ! array_key_exists('slug', $data)) {
            // Do not auto-regenerate slug on rename; keep stability unless explicitly set
        }
        // Ensure uniqueness per scope on update
        $newSlug = $data['slug'] ?? $taxonomy->slug;
        $newScope = array_key_exists('scope', $data) ? $data['scope'] : $taxonomy->scope;
        $exists = Taxonomy::query()
            ->where('slug', $newSlug)
            ->where('scope', $newScope)
            ->where('id', '!=', $taxonomy->id)
            ->exists();
        if ($exists) {
            return response()->json([
                'message' => 'Ce slug est déjà utilisé pour ce scope.',
                'errors' => ['slug' => ['Ce slug est déjà utilisé pour ce scope.']],
            ], 422);
        }
        $taxonomy->update($data);
        return response()->json($taxonomy);
    }

    public function destroy(Taxonomy $taxonomy): JsonResponse
    {
        if ($taxonomy->terms()->exists()) {
            return response()->json(['message' => 'Cannot delete a taxonomy with terms'], 422);
        }
        $taxonomy->delete();
        return response()->json(status: 204);
    }
}
