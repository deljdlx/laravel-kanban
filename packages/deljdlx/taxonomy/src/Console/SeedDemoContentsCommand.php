<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Console;

use Deljdlx\Taxonomy\Models\TaxonomyDemoContent;
use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Console\Command;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SeedDemoContentsCommand extends Command
{
    protected $signature = 'taxonomy:demo:contents
        {--count=25 : Number of demo contents to create}
        {--min-tags=1 : Minimum tags per content}
        {--max-tags=5 : Maximum tags per content}
        {--scope= : Filter terms to a given taxonomy scope}
        {--taxonomy= : Filter terms to a taxonomy slug}
        {--truncate : Truncate table and termables for this type before seeding}
        {--recreate : Drop and recreate the demo table before seeding}
        {--seed-taxonomies : Seed base taxonomies if no terms found}
        {--force : Allow running in production}';

    protected $description = 'Create taxonomy_demo_contents and seed them with random tags from existing terms';

    public function handle(): int
    {
        if ($this->option('force') !== true && app()->environment('production')) {
            $this->error('Refusing to run in production without --force');
            return self::FAILURE;
        }

        $count = max(1, (int) $this->option('count'));
        $minTags = max(0, (int) $this->option('min-tags'));
        $maxTags = max($minTags, (int) $this->option('max-tags'));
        $scope = $this->option('scope');
        $taxonomySlug = $this->option('taxonomy');
        $truncate = (bool) $this->option('truncate');
        $recreate = (bool) $this->option('recreate');
        $seedTaxo = (bool) $this->option('seed-taxonomies');

        // Prepare table
        if ($recreate && Schema::hasTable('taxonomy_demo_contents')) {
            Schema::drop('taxonomy_demo_contents');
        }
        if (!Schema::hasTable('taxonomy_demo_contents')) {
            Schema::create('taxonomy_demo_contents', function (Blueprint $table): void {
                $table->id();
                $table->string('title');
                $table->text('body')->nullable();
                $table->json('extra')->nullable();
                $table->timestamps();
            });
            $this->info('Created table taxonomy_demo_contents');
        }

        if ($truncate) {
            DB::table('taxonomy_demo_contents')->truncate();
            DB::table('termables')->where('termable_type', TaxonomyDemoContent::class)->delete();
            $this->info('Truncated taxonomy_demo_contents and cleared termables for demo content');
        }

        // Load term pool
        $termsQuery = Term::query()->with('taxonomy');
        if ($scope) {
            $termsQuery->whereHas('taxonomy', function ($q) use ($scope) { $q->where('scope', $scope); });
        }
        if ($taxonomySlug) {
            $termsQuery->whereHas('taxonomy', function ($q) use ($taxonomySlug) { $q->where('slug', $taxonomySlug); });
        }
        $terms = $termsQuery->get(['id', 'name', 'slug', 'taxonomy_id']);

        if ($terms->isEmpty()) {
            if ($seedTaxo) {
                $this->call('taxonomy:seed', [ '--preset' => 'global', '--scope' => $scope ?? 'global', '--force' => true ]);
                $terms = $termsQuery->get(['id', 'name', 'slug', 'taxonomy_id']);
            }
            if ($terms->isEmpty()) {
                $this->warn('No terms found. Aborting. Use --seed-taxonomies to seed base terms.');
                return self::SUCCESS;
            }
        }

        // Seed demo contents
        $attached = 0;
        for ($i = 1; $i <= $count; $i++) {
            $content = TaxonomyDemoContent::query()->create([
                'title' => sprintf('Demo content #%d', $i),
                'body' => 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
                'extra' => ['i' => $i],
            ]);

            // Choose tags
            $n = $maxTags > $minTags ? random_int($minTags, $maxTags) : $minTags;
            $n = min($n, max(0, $terms->count()));
            if ($n === 0) continue;
            // Normalize picks: for n=1 use random() (single model), else random($n) (Collection)
            $pick = $n === 1 ? collect([$terms->random()]) : $terms->random($n);

            $position = 0;
            foreach ($pick as $term) {
                $content->terms()->attach($term->id, [
                    'position' => $position,
                    'is_primary' => $position === 0,
                    'extra' => null,
                ]);
                $position++;
                $attached++;
            }
        }

        $this->info("Seeded {$count} demo contents with {$attached} term attachments.");
        return self::SUCCESS;
    }
}
