<?php

declare(strict_types=1);

namespace Tests\Feature;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxonomyResetCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_prunes_unexpected_terms_safely(): void
    {
        // Seed global
        $this->artisan('taxonomy:seed', [
            '--preset' => 'global',
            '--scope' => 'global',
            '--force' => true,
        ])->assertExitCode(0);

        $tx = Taxonomy::query()->where('slug', 'priority')->where('scope', 'global')->firstOrFail();

        // Add an extra unexpected term
        $extra = Term::create([
            'taxonomy_id' => $tx->id,
            'name' => 'Unexpected',
            'slug' => 'unexpected',
            'path' => '/unexpected',
            'depth' => 0,
        ]);
        $this->assertDatabaseHas('terms', ['id' => $extra->id]);

        // Dry-run prune: should report but not delete
        $this->artisan('taxonomy:reset', [
            '--preset' => 'global',
            '--scope' => 'global',
            '--prune' => true,
            '--dry-run' => true,
        ])->assertExitCode(0);
        $this->assertDatabaseHas('terms', ['id' => $extra->id]);

        // Apply prune: should delete the unexpected term
        $this->artisan('taxonomy:reset', [
            '--preset' => 'global',
            '--scope' => 'global',
            '--prune' => true,
            '--force' => true,
        ])->assertExitCode(0);
        $this->assertDatabaseMissing('terms', ['id' => $extra->id]);
    }
}
