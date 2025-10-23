<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Http\Controllers;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TermableController extends Controller
{
    /**
     * Attach one or more terms to a model.
     * Payload options:
     * - model_type (FQCN), model_id (int)
     * - term_ids: int[] OR taxonomy_slug + slugs: string[]
     */
    public function attach(Request $request): JsonResponse
    {
        $data = $request->validate([
            'model_type' => ['required','string'],
            'model_id' => ['required','integer'],
            'term_ids' => ['array'],
            'term_ids.*' => ['integer','exists:terms,id'],
            'taxonomy_slug' => ['string','nullable'],
            'slugs' => ['array','nullable'],
            'slugs.*' => ['string'],
        ]);
        [$model, $terms] = $this->resolveModelAndTerms($data);

        return DB::transaction(function () use ($model, $terms): JsonResponse {
            foreach ($terms as $term) {
                $attached = $model->terms()->whereKey($term->id)->exists();
                if (!$attached) {
                    $model->terms()->attach($term->id, ['position' => 0, 'is_primary' => false]);
                    $term->increment('usage_count');
                }
            }
            return response()->json($model->terms()->get());
        });
    }

    /** Detach one or more terms from a model. */
    public function detach(Request $request): JsonResponse
    {
        $data = $request->validate([
            'model_type' => ['required','string'],
            'model_id' => ['required','integer'],
            'term_ids' => ['array'],
            'term_ids.*' => ['integer','exists:terms,id'],
            'taxonomy_slug' => ['string','nullable'],
            'slugs' => ['array','nullable'],
            'slugs.*' => ['string'],
        ]);
        [$model, $terms] = $this->resolveModelAndTerms($data);

        return DB::transaction(function () use ($model, $terms): JsonResponse {
            foreach ($terms as $term) {
                $detached = $model->terms()->detach($term->id);
                if ($detached) {
                    $term->decrement('usage_count');
                }
            }
            return response()->json(status: 204);
        });
    }

    /** Sync terms for a model within a taxonomy by slugs or IDs. */
    public function sync(Request $request): JsonResponse
    {
        $data = $request->validate([
            'model_type' => ['required','string'],
            'model_id' => ['required','integer'],
            'term_ids' => ['array'],
            'term_ids.*' => ['integer','exists:terms,id'],
            'taxonomy_slug' => ['required_without:term_ids','string','nullable'],
            'slugs' => ['array','nullable'],
            'slugs.*' => ['string'],
        ]);
        [$model, $terms] = $this->resolveModelAndTerms($data, requireTaxonomy: true);

        return DB::transaction(function () use ($model, $terms, $data): JsonResponse {
            // Determine taxonomy scope for sync
            $taxonomyId = $terms->first()?->taxonomy_id;
            if (!$taxonomyId) {
                return response()->json(['message' => 'No taxonomy terms provided'], 422);
            }
            $current = $model->terms()->where('taxonomy_id', $taxonomyId)->pluck('terms.id');
            $targetIds = $terms->pluck('id');
            $detachIds = $current->diff($targetIds);
            $attachIds = $targetIds->diff($current);

            if ($detachIds->isNotEmpty()) {
                $model->terms()->detach($detachIds);
                Term::query()->whereIn('id', $detachIds)->decrement('usage_count');
            }
            if ($attachIds->isNotEmpty()) {
                $model->terms()->attach($attachIds->all());
                Term::query()->whereIn('id', $attachIds)->increment('usage_count');
            }

            return response()->json($model->terms()->where('taxonomy_id', $taxonomyId)->get());
        });
    }

    /**
     * @param array{model_type:string,model_id:int,term_ids?:array,taxonomy_slug?:string,slugs?:array} $data
     * @return array{0: EloquentModel, 1: \Illuminate\Support\Collection<Term>}
     */
    protected function resolveModelAndTerms(array $data, bool $requireTaxonomy = false): array
    {
        $modelClass = $data['model_type'];
        if (!class_exists($modelClass) || !is_subclass_of($modelClass, EloquentModel::class)) {
            abort(422, 'Invalid model_type');
        }
        /** @var EloquentModel $model */
        $model = $modelClass::query()->findOrFail((int) $data['model_id']);

        $terms = collect();
        if (!empty($data['term_ids'])) {
            $terms = Term::query()->whereIn('id', $data['term_ids'])->get();
        } elseif (!empty($data['taxonomy_slug']) && !empty($data['slugs'])) {
            $taxonomy = Taxonomy::query()->where('slug', $data['taxonomy_slug'])->firstOrFail();
            $terms = Term::query()
                ->where('taxonomy_id', $taxonomy->id)
                ->whereIn('slug', $data['slugs'])
                ->get();
            if ($terms->count() !== count($data['slugs'])) {
                abort(422, 'One or more terms not found in taxonomy');
            }
        } elseif ($requireTaxonomy) {
            abort(422, 'Provide term_ids or taxonomy_slug + slugs');
        }

        return [$model, $terms];
    }
}
