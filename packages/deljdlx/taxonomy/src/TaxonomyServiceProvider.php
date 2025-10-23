<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy;

use Illuminate\Support\ServiceProvider;
use Deljdlx\Taxonomy\Console\SeedTaxonomiesCommand;
use Deljdlx\Taxonomy\Console\ResetTaxonomiesCommand;
use Deljdlx\Taxonomy\Console\SeedDemoContentsCommand;

class TaxonomyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/taxonomy.php', 'taxonomy');
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/api.php');
        $this->loadRoutesFrom(__DIR__ . '/../routes/web.php');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'taxonomy');
        $this->publishes([
            __DIR__ . '/../config/taxonomy.php' => config_path('taxonomy.php'),
        ], 'taxonomy-config');

        if ($this->app->runningInConsole()) {
            $this->commands([
                SeedTaxonomiesCommand::class,
                ResetTaxonomiesCommand::class,
                SeedDemoContentsCommand::class,
            ]);
        }
    }
}
