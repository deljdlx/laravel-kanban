<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Concerns;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * High-level helpers to manage terms for termable models.
 * Requires the model to also use HasTerms (terms() morphToMany relation).
 */
trait InteractsWithTerms
{
    /**
     * Attach one or more terms to the model within a taxonomy scope.
     *
     * @param array<int,int|string>|int|string $terms IDs or slugs
     * @param int|string $taxonomy taxonomy id or slug
     * @param string|null $scope required when taxonomy is slug and not globally unique
     * @param array{createMissing?:bool,primary?:bool,positionStart?:int,extra?:array,upsert?:bool} $options
     */
    public function tag(array|int|string $terms, int|string $taxonomy, ?string $scope = null, array $options = []): static
    {
        $taxonomyId = $this->resolveTaxonomyId($taxonomy, $scope);
        $termModels = $this->resolveTerms($terms, $taxonomyId, (bool)($options['createMissing'] ?? false));

        if ($termModels->isEmpty()) {
            return $this;
        }

        $relation = $this->ensureTermsRelation();
        $start = (int)($options['positionStart'] ?? $this->nextPositionForTaxonomy($taxonomyId));
        $payload = [];
        $idx = 0;
        foreach ($termModels as $t) {
            $payload[$t->id] = [
                'position' => $start + $idx,
                'is_primary' => false,
                'extra' => $options['extra'] ?? null,
            ];
            $idx++;
        }

        $relation->syncWithoutDetaching($payload);

        if (!empty($options['primary'])) {
            // Mark the first as primary within this taxonomy
            $firstId = $termModels->first()->id;
            $this->setPrimaryWithinTaxonomy($firstId, $taxonomyId);
        }

        return $this;
    }

    /**
     * Detach given terms from the model within a taxonomy.
     *
     * @param array<int,int|string>|int|string $terms IDs or slugs
     */
    public function untag(array|int|string $terms, int|string $taxonomy, ?string $scope = null): static
    {
        $taxonomyId = $this->resolveTaxonomyId($taxonomy, $scope);
        $termModels = $this->resolveTerms($terms, $taxonomyId, false);
        if ($termModels->isEmpty()) return $this;
        $ids = $termModels->pluck('id')->all();

        // Detach only those within the taxonomy
        $this->terms()
            ->whereIn('terms.id', $ids)
            ->detach($ids);
        return $this;
    }

    /**
     * Sync the model terms to match the provided set within a taxonomy.
     *
     * @param array<int,int|string>|int|string $terms
     * @param array{createMissing?:bool,keepPrimary?:bool,reindexPositions?:bool,extra?:array} $options
     */
    public function syncTags(array|int|string $terms, int|string $taxonomy, ?string $scope = null, array $options = []): static
    {
        $taxonomyId = $this->resolveTaxonomyId($taxonomy, $scope);
        $desired = $this->resolveTerms($terms, $taxonomyId, (bool)($options['createMissing'] ?? false));
        $desiredIds = $desired->pluck('id')->values();

        // Current ids for this taxonomy only
        $currentIds = $this->terms()
            ->where('terms.taxonomy_id', $taxonomyId)
            ->pluck('terms.id');

        $toDetach = $currentIds->diff($desiredIds)->values();
        $toAttach = $desiredIds->diff($currentIds)->values();

        if ($toDetach->isNotEmpty()) {
            $this->terms()->detach($toDetach->all());
        }

        if ($toAttach->isNotEmpty()) {
            $start = $this->nextPositionForTaxonomy($taxonomyId);
            $payload = [];
            foreach ($toAttach->values() as $i => $id) {
                $payload[$id] = [
                    'position' => $start + $i,
                    'is_primary' => false,
                    'extra' => $options['extra'] ?? null,
                ];
            }
            $this->terms()->syncWithoutDetaching($payload);
        }

        if (!empty($options['reindexPositions'])) {
            $this->reindexPositions($taxonomyId);
        }

        if (!empty($options['keepPrimary']) === false && $desiredIds->isNotEmpty()) {
            $this->setPrimaryWithinTaxonomy((int)$desiredIds->first(), $taxonomyId);
        }

        return $this;
    }

    /** Set a specific term as primary within the given taxonomy for this model. */
    public function setPrimaryTag(int|string $term, int|string $taxonomy, ?string $scope = null): static
    {
        $taxonomyId = $this->resolveTaxonomyId($taxonomy, $scope);
        $t = $this->resolveTerms([$term], $taxonomyId, false)->first();
        if (!$t) {
            throw new InvalidArgumentException('Term not found in the provided taxonomy.');
        }
        $this->setPrimaryWithinTaxonomy($t->id, $taxonomyId);
        return $this;
    }

    /** Get attached terms for a taxonomy (ordered). */
    public function getTags(int|string $taxonomy, ?string $scope = null)
    {
        $taxonomyId = $this->resolveTaxonomyId($taxonomy, $scope);
        return $this->terms()
            ->where('terms.taxonomy_id', $taxonomyId)
            ->orderBy('termables.position')
            ->get();
    }

    /** Scope: models having any of the given terms within a taxonomy. */
    public function scopeWithAnyTerms(Builder $q, array $terms, int|string $taxonomy, ?string $scope = null): Builder
    {
        $taxonomyId = $this->resolveTaxonomyId($taxonomy, $scope);
        $ids = $this->resolveTermIds($terms, $taxonomyId);
        if (empty($ids)) return $q->whereRaw('1=0');
        return $q->whereHas('terms', function (Builder $b) use ($ids) {
            $b->whereIn('terms.id', $ids);
        });
    }

    /** Scope: models having all of the given terms within a taxonomy. */
    public function scopeWithAllTerms(Builder $q, array $terms, int|string $taxonomy, ?string $scope = null): Builder
    {
        $taxonomyId = $this->resolveTaxonomyId($taxonomy, $scope);
        $ids = $this->resolveTermIds($terms, $taxonomyId);
        foreach ($ids as $id) {
            $q->whereHas('terms', fn (Builder $b) => $b->where('terms.id', $id));
        }
        return $q;
    }

    /** Scope: models without any term from the taxonomy. */
    public function scopeWithNoTerms(Builder $q, int|string $taxonomy, ?string $scope = null): Builder
    {
        $taxonomyId = $this->resolveTaxonomyId($taxonomy, $scope);
        return $q->whereDoesntHave('terms', function (Builder $b) use ($taxonomyId) {
            $b->where('terms.taxonomy_id', $taxonomyId);
        });
    }

    // -------- Helpers ---------

    protected function ensureTermsRelation(): MorphToMany
    {
        if (!method_exists($this, 'terms')) {
            throw new InvalidArgumentException('Model must use HasTerms trait to provide terms() relation.');
        }
        /** @var MorphToMany $rel */
        $rel = $this->terms();
        return $rel;
    }

    protected function resolveTaxonomyId(int|string $taxonomy, ?string $scope = null): int
    {
        if (is_int($taxonomy) || ctype_digit((string)$taxonomy)) {
            $id = (int) $taxonomy;
            $exists = Taxonomy::query()->whereKey($id)->exists();
            if (!$exists) throw new InvalidArgumentException('Unknown taxonomy id: ' . $id);
            return $id;
        }
        $slug = trim((string)$taxonomy);
        $query = Taxonomy::query()->where('slug', $slug);
        if ($scope !== null && $scope !== '') {
            $query->where('scope', $scope);
        }
        $rows = $query->get(['id','slug','scope']);
        if ($rows->count() === 0) throw new InvalidArgumentException("Unknown taxonomy slug: {$slug}");
        if ($rows->count() > 1 && ($scope === null || $scope === '')) {
            throw new InvalidArgumentException('Ambiguous taxonomy slug across scopes; provide scope.');
        }
        return (int) $rows->first()->id;
    }

    /**
     * @param array<int,int|string>|int|string $terms
     */
    protected function resolveTerms(array|int|string $terms, int $taxonomyId, bool $createMissing)
    {
        $list = is_array($terms) ? $terms : [$terms];
        $ids = [];
        $slugs = [];
        foreach ($list as $t) {
            if (is_int($t) || ctype_digit((string)$t)) {
                $ids[] = (int) $t;
            } else {
                $slugs[] = (string) $t;
            }
        }
        $found = Term::query()
            ->where('taxonomy_id', $taxonomyId)
            ->when(!empty($ids), fn ($q) => $q->whereIn('id', $ids))
            ->orWhere(function ($q) use ($taxonomyId, $slugs) {
                if (!empty($slugs)) {
                    $q->where('taxonomy_id', $taxonomyId)->whereIn('slug', $slugs);
                }
            })
            ->get();

        // Create missing by slug if requested
        if ($createMissing && !empty($slugs)) {
            $foundSlugs = $found->pluck('slug')->all();
            $missing = array_values(array_diff($slugs, $foundSlugs));
            foreach ($missing as $slug) {
                $normSlug = Str::of((string)$slug)->slug()->value();
                $name = Str::of($slug)->replace(['-','_'], ' ')->title()->value();
                $term = new Term();
                $term->taxonomy_id = $taxonomyId;
                $term->name = $name;
                $term->slug = $normSlug;
                $term->description = null;
                $term->parent_id = null;
                $term->depth = 0;
                $term->path = '/' . $normSlug;
                $term->save();
                $found->push($term);
            }
        }

        // Filter to only requested ids/slugs
        return $found->filter(function (Term $t) use ($ids, $slugs) {
            return in_array($t->id, $ids, true) || in_array($t->slug, $slugs, true) || (empty($ids) && empty($slugs));
        })->values();
    }

    /**
     * @param array<int,int|string> $terms
     * @return array<int>
     */
    protected function resolveTermIds(array $terms, int $taxonomyId): array
    {
        $list = is_array($terms) ? $terms : [$terms];
        $ids = [];
        $slugs = [];
        foreach ($list as $t) {
            if (is_int($t) || ctype_digit((string)$t)) $ids[] = (int)$t; else $slugs[] = (string)$t;
        }
        $q = Term::query()->where('taxonomy_id', $taxonomyId);
        if (!empty($ids)) $q->whereIn('id', $ids);
        if (!empty($slugs)) $q->orWhere(function ($qq) use ($taxonomyId, $slugs) {
            $qq->where('taxonomy_id', $taxonomyId)->whereIn('slug', $slugs);
        });
        return $q->pluck('id')->all();
    }

    protected function nextPositionForTaxonomy(int $taxonomyId): int
    {
        $max = $this->terms()
            ->where('terms.taxonomy_id', $taxonomyId)
            ->max('termables.position');
        return is_numeric($max) ? ((int)$max + 1) : 0;
    }

    protected function reindexPositions(int $taxonomyId): void
    {
        $rows = $this->terms()
            ->where('terms.taxonomy_id', $taxonomyId)
            ->orderBy('termables.position')
            ->get(['terms.id']);
        foreach ($rows as $i => $row) {
            DB::table('termables')
                ->where('termable_type', static::class)
                ->where('termable_id', $this->getKey())
                ->where('term_id', $row->id)
                ->update(['position' => $i]);
        }
    }

    protected function setPrimaryWithinTaxonomy(int $termId, int $taxonomyId): void
    {
        // Reset all in taxonomy to false
        DB::table('termables')
            ->join('terms', 'terms.id', '=', 'termables.term_id')
            ->where('termables.termable_type', static::class)
            ->where('termables.termable_id', $this->getKey())
            ->where('terms.taxonomy_id', $taxonomyId)
            ->update(['termables.is_primary' => false]);

        // Set selected to true
        DB::table('termables')
            ->where('termable_type', static::class)
            ->where('termable_id', $this->getKey())
            ->where('term_id', $termId)
            ->update(['is_primary' => true]);
    }
}
