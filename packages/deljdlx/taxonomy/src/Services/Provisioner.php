<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Services;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Support\Facades\DB;

/**
 * Provision taxonomies and terms from preset arrays; idempotent by (scope, taxonomy.slug) and (taxonomy_id, term.slug).
 */
final class Provisioner
{
    /**
     * @param array{taxonomies: array<int, array<string, mixed>>} $preset
     */
    public function provision(array $preset, string $scope, bool $dryRun = false): array
    {
        $created = ['taxonomies' => 0, 'terms' => 0];
        DB::transaction(function () use ($preset, $scope, $dryRun, &$created): void {
            foreach ($preset['taxonomies'] as $tx) {
                $taxonomy = $this->upsertTaxonomy($tx, $scope, $dryRun, $created);
                // terms list
                if (!empty($tx['terms']) && is_array($tx['terms'])) {
                    foreach ($tx['terms'] as $term) {
                        $this->upsertTerm($taxonomy, $term, null, $dryRun, $created);
                    }
                }
                // tree for hierarchical
                if (!empty($tx['tree']) && is_array($tx['tree'])) {
                    foreach ($tx['tree'] as $slug => $children) {
                        $this->upsertTree($taxonomy, (string) $slug, (string) ucfirst((string)$slug), $children, null, $dryRun, $created);
                    }
                }
            }
        });
        return $created;
    }

    /**
     * @param array<string, mixed> $tx
     */
    private function upsertTaxonomy(array $tx, string $scope, bool $dryRun, array &$created): Taxonomy
    {
        $slug = (string) ($tx['slug'] ?? '');
        $name = (string) ($tx['name'] ?? $slug);
        $hierarchical = (bool) ($tx['hierarchical'] ?? false);

        $existing = Taxonomy::query()->where('slug', $slug)->where('scope', $scope)->first();
        if ($existing) {
            if (!$dryRun) {
                $existing->update(['name' => $name, 'hierarchical' => $hierarchical]);
            }
            return $existing;
        }
        if ($dryRun) {
            $created['taxonomies']++;
            return new Taxonomy(['slug' => $slug, 'name' => $name, 'scope' => $scope, 'hierarchical' => $hierarchical]);
        }
        $taxonomy = Taxonomy::create([
            'slug' => $slug,
            'name' => $name,
            'scope' => $scope,
            'hierarchical' => $hierarchical,
        ]);
        $created['taxonomies']++;
        return $taxonomy;
    }

    /**
     * @param array<string, mixed> $children
     */
    private function upsertTree(Taxonomy $taxonomy, string $slug, string $name, array $children, ?Term $parent, bool $dryRun, array &$created): void
    {
        $term = $this->upsertTerm($taxonomy, ['slug' => $slug, 'name' => $name], $parent, $dryRun, $created);
        foreach ($children as $childSlug => $childChildren) {
            $this->upsertTree($taxonomy, (string) $childSlug, (string) ucfirst((string)$childSlug), (array) $childChildren, $term, $dryRun, $created);
        }
    }

    /**
     * @param array<string, mixed> $data
     */
    private function upsertTerm(Taxonomy $taxonomy, array $data, ?Term $parent, bool $dryRun, array &$created): Term
    {
        $slug = (string) ($data['slug'] ?? '');
        $name = (string) ($data['name'] ?? $slug);
        $description = $data['description'] ?? null;
        $extra = $data['extra'] ?? null;

        $existing = Term::query()->where('taxonomy_id', $taxonomy->id)->where('slug', $slug)->first();
        if ($existing) {
            // update parent if changed (move) and path/depth accordingly
            $newParentId = $parent?->id;
            $changedParent = $existing->parent_id !== $newParentId;
            if (!$dryRun) {
                $existing->name = $name;
                $existing->description = $description;
                if ($extra !== null) { $existing->extra = $extra; }
                if ($changedParent) {
                    $existing->parent_id = $newParentId;
                }
                $existing->depth = $parent ? ($parent->depth + 1) : 0;
                $existing->path = ($parent ? rtrim($parent->path, '/') : '') . '/' . $existing->slug;
                $existing->save();
            }
            return $existing;
        }

        if ($dryRun) {
            $created['terms']++;
            return new Term([
                'taxonomy_id' => $taxonomy->id,
                'slug' => $slug,
                'name' => $name,
                'description' => $description,
                'parent_id' => $parent?->id,
                'path' => ($parent ? rtrim($parent->path, '/') : '') . '/' . $slug,
                'depth' => $parent ? ($parent->depth + 1) : 0,
                'extra' => $extra,
            ]);
        }

        $term = new Term();
        $term->taxonomy_id = $taxonomy->id;
        $term->slug = $slug;
        $term->name = $name;
        $term->description = $description;
        $term->parent_id = $parent?->id;
        $term->depth = $parent ? ($parent->depth + 1) : 0;
        $term->path = ($parent ? rtrim($parent->path, '/') : '') . '/' . $slug;
        $term->extra = $extra;
        $term->save();
        $created['terms']++;
        return $term;
    }
}
