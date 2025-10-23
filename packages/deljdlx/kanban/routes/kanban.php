<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\RedirectResponse;
use Deljdlx\Kanban\Http\Controllers\KanbanPingController;
use Deljdlx\Kanban\Http\Controllers\Auth\LoginController;
use Deljdlx\Kanban\Http\Controllers\Auth\RegisterController;
use Deljdlx\Kanban\Http\Controllers\Auth\LogoutController;
use Deljdlx\Kanban\Http\Controllers\MeController;
use Deljdlx\Kanban\Http\Controllers\DashboardController;
use Deljdlx\Kanban\Http\Controllers\ShowcaseController;
use Deljdlx\Kanban\Http\Controllers\TaxonomyExplorerController;
use Deljdlx\Kanban\Http\Controllers\TaxonomyShowBySlugController;
use Deljdlx\Taxonomy\Models\Taxonomy;

Route::prefix(config('kanban.route_prefix', 'kanban'))
	->name('kanban.')
	->group(static function (): void {
	// dashboard
	Route::get('/', DashboardController::class)->name('dashboard');

	// showcase (heavy Tabler components, no charts)
	Route::get('/showcase', ShowcaseController::class)->name('showcase');

	// taxonomy explorer
	Route::get('/taxonomies', TaxonomyExplorerController::class)->name('taxonomies');

	// Legacy: taxonomy show by numeric id -> redirect permanently to scope/slug (or explorer as fallback)
	Route::get('/taxonomies/{taxonomy}',
		static function (Taxonomy $taxonomy): RedirectResponse {
			if (! empty($taxonomy->scope)) {
				return redirect()->route(
					'kanban.taxonomies.show.slug',
					['scope' => $taxonomy->scope, 'slug' => $taxonomy->slug],
					301
				);
			}

			// No scope defined: fall back to explorer with preselected slug
			return redirect()->route('kanban.taxonomies', ['slug' => $taxonomy->slug], 301);
		}
	)
		->whereNumber('taxonomy')
		->name('taxonomies.show.legacy');
	// taxonomy show by scope/slug (preferred stable link)
	Route::get('/scopes/{scope}/taxonomies/{slug}', TaxonomyShowBySlugController::class)->name('taxonomies.show.slug');

	// healthcheck
		Route::get('/ping', KanbanPingController::class)->name('ping');

		// auth screens (guest only)
		Route::middleware(['web', 'guest'])->group(static function (): void {
			Route::get('/login', [LoginController::class, 'create'])->name('login');
			Route::post('/login', [LoginController::class, 'store'])->name('login.store');

			Route::get('/register', [RegisterController::class, 'create'])->name('register');
			Route::post('/register', [RegisterController::class, 'store'])->name('register.store');
		});

		// protected area
		Route::middleware(['web', 'auth'])->group(static function (): void {
			Route::post('/logout', LogoutController::class)->name('logout');
			Route::get('/me', MeController::class)->name('me');
		});
	});
