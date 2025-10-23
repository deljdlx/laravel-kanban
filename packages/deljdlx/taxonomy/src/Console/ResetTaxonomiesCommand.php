<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Console;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Deljdlx\Taxonomy\Models\Term;
use Deljdlx\Taxonomy\Services\Provisioner;
use Deljdlx\Taxonomy\Support\Presets;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ResetTaxonomiesCommand extends Command
{
    protected $signature = 'taxonomy:reset
        {--preset= : Preset name (global|kanban|blog|ecommerce|all)}
        {--scope= : Scope to apply (e.g., global, kanban, incident.management)}
        {--dry-run : Show actions without writing}
        {--export= : Export current state (JSON) before applying}
        {--prune : Remove terms not present in the preset (safe by default)}
        {--allow-detach : Allow detaching used terms before deletion (dangerous)}
        {--force : Force in production}';

    protected $description = 'Reset preset provisioning safely: upsert + optional prune with usage checks and optional export';

    public function handle(Provisioner $provisioner): int
    {
        if ($this->option('force') !== true && app()->environment('production')) {
            $this->error('Refusing to run in production without --force');
            return self::FAILURE;
        }

        $presetOpt = (string) ($this->option('preset') ?: 'global');
        $scope = (string) ($this->option('scope') ?: $presetOpt);
        $dry = (bool) $this->option('dry-run');
        $prune = (bool) $this->option('prune');
        $allowDetach = (bool) $this->option('allow-detach');
        $exportPath = $this->option('export');

        $catalog = Presets::all();
        $presets = [];
        if ($presetOpt === 'all') {
            $presets = array_values($catalog);
        } elseif (isset($catalog[$presetOpt])) {
            $presets[] = $catalog[$presetOpt];
        } else {
            $this->error("Unknown preset: {$presetOpt}");
            return self::FAILURE;
        }

        $presetSlugs = $this->collectPresetTaxonomySlugs($presets);

        // Export current state if requested
        if (!empty($exportPath)) {
            $this->exportCurrentState((string) $exportPath, $scope, $presetSlugs);
            $this->info("Exported current state to: {$exportPath}");
        }

        // 1) Upsert baseline (safe)
        $upsertTotals = ['taxonomies' => 0, 'terms' => 0];
        foreach ($presets as $preset) {
            $res = $provisioner->provision($preset, $scope, $dry);
            $upsertTotals['taxonomies'] += $res['taxonomies'];
            $upsertTotals['terms'] += $res['terms'];
        }

        // 2) Optional prune (safe by default)
        $deleted = ['terms' => 0, 'skipped_used' => 0, 'skipped_children' => 0];
        if ($prune) {
            $expectedTermsByTx = $this->buildExpectedTermSlugsByTaxonomy($presets);
            $deleted = $this->pruneExtraTerms($scope, $presetSlugs, $expectedTermsByTx, $dry, $allowDetach);
        }

        $mode = $dry ? 'DRY-RUN' : 'APPLIED';
        $this->info("{$mode} UPSERT: taxonomies={$upsertTotals['taxonomies']}, terms={$upsertTotals['terms']}, scope={$scope}");
        if ($prune) {
            $this->info("{$mode} PRUNE: deleted_terms={$deleted['terms']}, skipped_used={$deleted['skipped_used']}, skipped_children={$deleted['skipped_children']}");
            if ($allowDetach) {
                $this->warn('Note: --allow-detach was enabled; used terms may have been detached before deletion.');
            }
        }

        return self::SUCCESS;
    }

    /**
     * @param array<int, array> $presets
     * @return array<int, string> taxonomy slugs
     */
    private function collectPresetTaxonomySlugs(array $presets): array
    {
        $slugs = [];
        foreach ($presets as $preset) {
            foreach (($preset['taxonomies'] ?? []) as $tx) {
                $slugs[] = (string) ($tx['slug'] ?? '');
            }
        }
        return array_values(array_unique(array_filter($slugs)));
    }

    /**
     * Export current taxonomies/terms state (for given scope and taxonomy slugs) to JSON.
     * @param string $path
     * @param string $scope
     * @param array<int,string> $presetSlugs
     */
    private function exportCurrentState(string $path, string $scope, array $presetSlugs): void
    {
        $data = [];
        $taxonomies = Taxonomy::query()->where('scope', $scope)->whereIn('slug', $presetSlugs)->get();
        foreach ($taxonomies as $tx) {
            $terms = Term::query()->where('taxonomy_id', $tx->id)->orderBy('path')->get();
            $data[] = [
                'taxonomy' => $tx->toArray(),
                'terms' => $terms->toArray(),
            ];
        }
        if (!Str::startsWith($path, ['/','./'])) {
            // default to storage/app if relative without ./
            $path = storage_path('app/'.$path);
        }
        @mkdir(dirname($path), 0777, true);
        file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    /**
     * Build expected term slug sets per taxonomy from presets (aggregating both 'terms' and 'tree').
     * @param array<int, array> $presets
     * @return array<string, array<int,string>> map taxonomy_slug => [term_slugs]
     */
    private function buildExpectedTermSlugsByTaxonomy(array $presets): array
    {
        $map = [];
        foreach ($presets as $preset) {
            foreach (($preset['taxonomies'] ?? []) as $tx) {
                $slugTx = (string) ($tx['slug'] ?? '');
                $set = $map[$slugTx] ?? [];
                foreach (($tx['terms'] ?? []) as $t) {
                    $set[] = (string) ($t['slug'] ?? '');
                }
                if (!empty($tx['tree']) && is_array($tx['tree'])) {
                    $set = array_merge($set, $this->flattenTreeSlugs($tx['tree']));
                }
                $map[$slugTx] = array_values(array_unique(array_filter($set)));
            }
        }
        return $map;
    }

    /**
     * @param array<string, mixed> $tree
     * @return array<int, string>
     */
    private function flattenTreeSlugs(array $tree): array
    {
        $out = [];
        foreach ($tree as $slug => $children) {
            $out[] = (string) $slug;
            if (is_array($children)) {
                $out = array_merge($out, $this->flattenTreeSlugs($children));
            }
        }
        return $out;
    }

    /**
     * Prune extra terms not present in preset for the given scope and taxonomy slugs.
     * Safe by default: skip used terms and parents having children; optional detach.
     *
     * @param string $scope
     * @param array<int,string> $presetSlugs
     * @param array<string, array<int,string>> $expectedTermsByTx
     * @return array{terms:int, skipped_used:int, skipped_children:int}
     */
    private function pruneExtraTerms(string $scope, array $presetSlugs, array $expectedTermsByTx, bool $dry, bool $allowDetach): array
    {
        $deleted = ['terms' => 0, 'skipped_used' => 0, 'skipped_children' => 0];
        $taxonomies = Taxonomy::query()->where('scope', $scope)->whereIn('slug', $presetSlugs)->get();
        foreach ($taxonomies as $tx) {
            $expected = $expectedTermsByTx[$tx->slug] ?? [];
            $expectedSet = array_flip($expected);
            $terms = Term::query()->where('taxonomy_id', $tx->id)->get();
            // delete children after leaves: order by path length desc
            $terms = $terms->sortByDesc(fn($t) => strlen((string) $t->path));
            foreach ($terms as $term) {
                if (isset($expectedSet[$term->slug])) {
                    continue; // keep expected
                }
                // skip if has children
                if ($term->children()->exists()) {
                    $deleted['skipped_children']++;
                    continue;
                }
                // check usage
                $used = DB::table('termables')->where('term_id', $term->id)->exists();
                if ($used && !$allowDetach) {
                    $deleted['skipped_used']++;
                    continue;
                }
                if ($dry) {
                    $deleted['terms']++;
                    $this->line("[DRY] delete term {$term->id} {$term->slug} (taxonomy {$tx->slug})");
                    continue;
                }
                if ($used && $allowDetach) {
                    DB::table('termables')->where('term_id', $term->id)->delete();
                }
                $term->delete();
                $deleted['terms']++;
            }
        }
        return $deleted;
    }
}
