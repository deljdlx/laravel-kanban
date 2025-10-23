<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Http\Controllers;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class TermController extends Controller
{
    public function checkSlug(Request $request, Taxonomy $taxonomy): JsonResponse
    {
        $data = $request->validate([
            'slug' => ['nullable','string','max:255'],
            'name' => ['nullable','string','max:255'],
        ]);
        $slug = trim((string) ($data['slug'] ?? ''));
        if ($slug === '' && !empty($data['name'])) {
            $slug = str($data['name'])->slug()->value();
        }
        if ($slug === '') {
            return response()->json(['available' => false, 'slug' => ''], 200);
        }
        $exists = Term::query()
            ->where('taxonomy_id', $taxonomy->id)
            ->where('slug', $slug)
            ->exists();
        return response()->json(['available' => !$exists, 'slug' => $slug], 200);
    }

    public function index(Request $request, Taxonomy $taxonomy): JsonResponse
    {
        $perPage = min(max((int) $request->integer('per_page', 50), 1), 200);
        $query = Term::query()->where('taxonomy_id', $taxonomy->id);
        $paginator = QueryBuilder::for($query)
            ->allowedFilters([
                AllowedFilter::exact('id'),
                AllowedFilter::exact('parent_id'),
                'name', 'slug',
            ])
            ->allowedSorts(['id','name','slug','depth','usage_count'])
            ->defaultSort('id')
            ->paginate($perPage)
            ->appends($request->query());
        return response()->json($paginator);
    }

    public function store(Request $request, Taxonomy $taxonomy): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'slug' => ['nullable','string','max:255', Rule::unique('terms', 'slug')->where('taxonomy_id', $taxonomy->id)],
            'description' => ['nullable','string'],
            'parent_id' => ['nullable','integer','exists:terms,id'],
        ]);
        $slug = $data['slug'] ?? str($data['name'])->slug()->value();
        $parent = null;
        if (!empty($data['parent_id'])) {
            $parent = Term::query()->where('taxonomy_id', $taxonomy->id)->findOrFail($data['parent_id']);
        }

        // When slug is auto-generated (or even provided), proactively check uniqueness per taxonomy
        $exists = Term::query()
            ->where('taxonomy_id', $taxonomy->id)
            ->where('slug', $slug)
            ->exists();
        if ($exists) {
            return response()->json([
                'message' => 'Ce slug est déjà utilisé dans cette taxonomie. Modifiez le slug ou le nom.',
                'errors' => [
                    'slug' => ['Ce slug est déjà utilisé dans cette taxonomie.'],
                ],
            ], 422);
        }

        return DB::transaction(function () use ($taxonomy, $data, $slug, $parent): JsonResponse {
            $term = new Term();
            $term->taxonomy_id = $taxonomy->id;
            $term->name = $data['name'];
            $term->slug = $slug;
            $term->description = $data['description'] ?? null;
            $term->parent_id = $parent?->id;
            $term->depth = $parent ? ($parent->depth + 1) : 0;
            $term->path = ($parent ? rtrim($parent->path, '/') : '') . '/' . $slug;
            $term->save();
            return response()->json($term, 201);
        });
    }

    public function show(Term $term): JsonResponse
    {
        return response()->json($term);
    }

    public function update(Request $request, Term $term): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes','string','max:255'],
            'slug' => ['sometimes','string','max:255', Rule::unique('terms', 'slug')->ignore($term->id)->where('taxonomy_id', $term->taxonomy_id)],
            'description' => ['sometimes','nullable','string'],
            'parent_id' => ['sometimes','nullable','integer','exists:terms,id'],
        ]);
        return DB::transaction(function () use ($term, $data): JsonResponse {
            $wasParent = $term->parent_id;
            $wasSlug = $term->slug;
            $term->fill($data);
            // Update path/depth if parent or slug changed
            if (array_key_exists('parent_id', $data) || array_key_exists('slug', $data) || array_key_exists('name', $data)) {
                $parent = $term->parent_id ? Term::query()->findOrFail($term->parent_id) : null;
                $slug = $term->slug;
                $term->depth = $parent ? ($parent->depth + 1) : 0;
                $term->path = ($parent ? rtrim($parent->path, '/') : '') . '/' . $slug;
            }
            $term->save();
            return response()->json($term);
        });
    }

    public function destroy(Term $term): JsonResponse
    {
        if ($term->children()->exists()) {
            return response()->json(['message' => 'Cannot delete a term with children'], 422);
        }
        $term->delete();
        return response()->json(status: 204);
    }
}
