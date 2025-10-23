<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Console;

use Deljdlx\Taxonomy\Services\Provisioner;
use Deljdlx\Taxonomy\Support\Presets;
use Illuminate\Console\Command;

class SeedTaxonomiesCommand extends Command
{
    protected $signature = 'taxonomy:seed
        {--preset= : Preset name (global|kanban|blog|ecommerce|all)}
        {--scope= : Scope to apply (e.g., global, kanban, incident.management)}
        {--dry-run : Show actions without writing}
        {--prune : Remove terms not present in the preset (not implemented yet)}
        {--force : Force in production}';

    protected $description = 'Provision illustrative taxonomies and terms (idempotent)';

    public function handle(Provisioner $provisioner): int
    {
        if ($this->option('force') !== true && app()->environment('production')) {
            $this->error('Refusing to run in production without --force');
            return self::FAILURE;
        }

        $presetOpt = $this->option('preset') ?: 'global';
        $scope = (string) ($this->option('scope') ?: $presetOpt);
        $dry = (bool) $this->option('dry-run');
        $prune = (bool) $this->option('prune');

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

        $total = ['taxonomies' => 0, 'terms' => 0];
        foreach ($presets as $preset) {
            $res = $provisioner->provision($preset, $scope, $dry);
            $total['taxonomies'] += $res['taxonomies'];
            $total['terms'] += $res['terms'];
        }

        if ($prune) {
            $this->warn('Prune is not implemented yet; skipping.');
        }

        $msg = $dry ? 'DRY-RUN' : 'APPLIED';
        $this->info("{$msg}: taxonomies={$total['taxonomies']}, terms={$total['terms']}, scope={$scope}");
        return self::SUCCESS;
    }
}
