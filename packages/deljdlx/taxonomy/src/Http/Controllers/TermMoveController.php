<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Http\Controllers;

use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class TermMoveController extends Controller
{
    public function __invoke(Term $term, Request $request): JsonResponse
    {
        $data = $request->validate([
            'parent_id' => ['nullable','integer','exists:terms,id'],
        ]);

        return DB::transaction(function () use ($term, $data): JsonResponse {
            $newParent = null;
            if (!empty($data['parent_id'])) {
                $newParent = Term::query()->findOrFail($data['parent_id']);
                // prevent moving across taxonomy
                if ($newParent->taxonomy_id !== $term->taxonomy_id) {
                    return response()->json(['message' => 'Parent must belong to the same taxonomy'], 422);
                }
                // prevent cycles
                if (str_starts_with($newParent->path . '/', rtrim($term->path, '/') . '/')) {
                    return response()->json(['message' => 'Cannot move a term under its descendant'], 422);
                }
            }
            $term->parent_id = $newParent?->id;
            $term->depth = $newParent ? ($newParent->depth + 1) : 0;
            $term->path = ($newParent ? rtrim($newParent->path, '/') : '') . '/' . $term->slug;
            $term->save();

            // update descendants paths/depths
            $descendants = Term::query()
                ->where('taxonomy_id', $term->taxonomy_id)
                ->where('path', 'like', rtrim($term->getOriginal('path'), '/') . '/%')
                ->get();
            foreach ($descendants as $child) {
                $rel = substr($child->getOriginal('path'), strlen(rtrim($term->getOriginal('path'), '/')));
                $child->path = rtrim($term->path, '/') . $rel;
                $child->depth = substr_count($child->path, '/') - 1; // because path starts with /
                $child->save();
            }

            return response()->json($term->fresh());
        });
    }
}
