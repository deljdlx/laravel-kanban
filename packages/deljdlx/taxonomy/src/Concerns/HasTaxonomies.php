<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Concerns;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Derived helpers to work with Taxonomies from a termable model.
 * Requires the model to also use HasTerms (terms() morphToMany relation).
 */
trait HasTaxonomies
{
    /**
     * Build a query for distinct taxonomies attached to this model via its terms.
     */
    public function taxonomiesQuery(): Builder
    {
        return Taxonomy::query()
            ->select('taxonomies.*')
            ->join('terms', 'terms.taxonomy_id', '=', 'taxonomies.id')
            ->join('termables', 'termables.term_id', '=', 'terms.id')
            ->where('termables.termable_type', static::class)
            ->where('termables.termable_id', $this->getKey())
            ->distinct();
    }

    /**
     * Get distinct taxonomies attached to this model.
     */
    public function taxonomies(): Collection
    {
        return $this->taxonomiesQuery()->get();
    }

    /**
     * Group taxonomies by scope for this model.
     *
     * @return array<string, Collection>
     */
    public function taxonomiesByScope(): array
    {
        return $this->taxonomies()->groupBy(fn (Taxonomy $t) => (string) $t->scope)->all();
    }

    /**
     * Scope: models that have at least one term in the given taxonomy (by id or slug, optionally scoped).
     */
    public function scopeWithTaxonomy(Builder $q, int|string $taxonomy, ?string $scope = null): Builder
    {
        // When taxonomy is slug, filter by scope if provided; otherwise, match any scope for that slug
        return $q->whereHas('terms', function (Builder $b) use ($taxonomy, $scope) {
            $b->whereHas('taxonomy', function (Builder $tb) use ($taxonomy, $scope) {
                if (is_int($taxonomy) || ctype_digit((string) $taxonomy)) {
                    $tb->where('taxonomies.id', (int) $taxonomy);
                } else {
                    $tb->where('taxonomies.slug', (string) $taxonomy);
                    if ($scope !== null && $scope !== '') {
                        $tb->where('taxonomies.scope', $scope);
                    }
                }
            });
        });
    }
}
