<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Post;
use Deljdlx\Taxonomy\Models\Taxonomy;
use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TermablesApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_attach_detach_sync_terms(): void
    {
        $post = Post::create(['title' => 'Hello', 'content' => 'World', 'published' => false]);
        $tx = Taxonomy::create(['name' => 'Labels', 'slug' => 'labels']);
        $a = Term::create(['taxonomy_id' => $tx->id, 'name' => 'A', 'slug' => 'a', 'path' => '/a', 'depth' => 0]);
        $b = Term::create(['taxonomy_id' => $tx->id, 'name' => 'B', 'slug' => 'b', 'path' => '/b', 'depth' => 0]);

        // Attach by slugs
        $this->postJson('/app/api/termables/attach', [
            'model_type' => Post::class,
            'model_id' => $post->id,
            'taxonomy_slug' => 'labels',
            'slugs' => ['a'],
        ])->assertOk();

        $this->assertDatabaseHas('termables', [
            'termable_type' => Post::class,
            'termable_id' => $post->id,
            'term_id' => $a->id,
        ]);

        // Sync to [b]
        $this->postJson('/app/api/termables/sync', [
            'model_type' => Post::class,
            'model_id' => $post->id,
            'taxonomy_slug' => 'labels',
            'slugs' => ['b'],
        ])->assertOk();

        $this->assertDatabaseMissing('termables', [
            'termable_type' => Post::class,
            'termable_id' => $post->id,
            'term_id' => $a->id,
        ]);
        $this->assertDatabaseHas('termables', [
            'termable_type' => Post::class,
            'termable_id' => $post->id,
            'term_id' => $b->id,
        ]);

        // Detach by ids
        $this->postJson('/app/api/termables/detach', [
            'model_type' => Post::class,
            'model_id' => $post->id,
            'term_ids' => [$b->id],
        ])->assertNoContent();

        $this->assertDatabaseMissing('termables', [
            'termable_type' => Post::class,
            'termable_id' => $post->id,
            'term_id' => $b->id,
        ]);
    }
}
