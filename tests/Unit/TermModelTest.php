<?php

declare(strict_types=1);

namespace Tests\Unit;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TermModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_path_and_depth_are_built(): void
    {
        $tx = Taxonomy::create(['name' => 'Cats', 'slug' => 'cats', 'hierarchical' => true]);
        $p = Term::create(['taxonomy_id' => $tx->id, 'name' => 'Parent', 'slug' => 'parent', 'path' => '/parent', 'depth' => 0]);
        $c = Term::create(['taxonomy_id' => $tx->id, 'name' => 'Child', 'slug' => 'child', 'parent_id' => $p->id, 'path' => '/parent/child', 'depth' => 1]);
        $this->assertSame('/parent/child', $c->path);
        $this->assertSame(1, $c->depth);
    }
}
