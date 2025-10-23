<?php

declare(strict_types=1);

namespace Tests\Feature;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxonomySeedCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_seed_global_is_idempotent(): void
    {
        // apply
        $this->artisan('taxonomy:seed', [
            '--preset' => 'global',
            '--scope' => 'global',
            '--force' => true,
        ])->assertExitCode(0);

        $countTx = Taxonomy::query()->where('scope', 'global')->count();
        $countTerms = Term::query()->count();
        $this->assertGreaterThan(0, $countTx);
        $this->assertGreaterThan(0, $countTerms);

        // re-apply (should not duplicate)
        $this->artisan('taxonomy:seed', [
            '--preset' => 'global',
            '--scope' => 'global',
            '--force' => true,
        ])->assertExitCode(0);

        $this->assertSame($countTx, Taxonomy::query()->where('scope', 'global')->count());
        $this->assertSame($countTerms, Term::query()->count());
    }
}
