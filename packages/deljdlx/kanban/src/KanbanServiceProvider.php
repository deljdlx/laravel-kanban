<?php

declare(strict_types=1);

namespace Deljdlx\Kanban;

use Illuminate\Support\ServiceProvider;

/**
 * KanbanServiceProvider
 *
 * Empty provider for the deljdlx/kanban package.
 * - Auto-discovered by Laravel via composer extra.laravel.providers
 * - Ready to load routes/config/views when needed
 */
final class KanbanServiceProvider extends ServiceProvider
{
    /**
     * Register bindings/services.
     */
    public function register(): void
    {
        // Merge package config under key 'kanban'
        $this->mergeConfigFrom(__DIR__ . '/../config/kanban.php', 'kanban');
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Load package routes (disable by removing this line if you manage routes elsewhere)
        $this->loadRoutesFrom(__DIR__ . '/../routes/kanban.php');

        // Load views with namespace 'kanban'
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'kanban');

        // Publish config for customization
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../config/kanban.php' => config_path('kanban.php'),
            ], 'kanban-config');

            $this->publishes([
                __DIR__ . '/../resources/views' => resource_path('views/vendor/kanban'),
            ], 'kanban-views');
        }
    }
}
