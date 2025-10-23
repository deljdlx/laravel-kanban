<?php

declare(strict_types=1);

namespace Tests\Feature;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxonomyApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_crud_taxonomy_and_terms(): void
    {
        // create taxonomy
        $resp = $this->postJson('/app/api/taxonomies', [
            'name' => 'Labels',
            'hierarchical' => false,
        ]);
        $resp->assertCreated();
        $taxonomyId = $resp->json('id');

        // list taxonomies
        $this->getJson('/app/api/taxonomies')->assertOk()->assertJsonFragment(['name' => 'Labels']);

        // create term
        $resp = $this->postJson("/app/api/taxonomies/{$taxonomyId}/terms", [
            'name' => 'Urgent',
        ]);
        $resp->assertCreated();
        $termId = $resp->json('id');

        // get term
        $this->getJson("/app/api/terms/{$termId}")->assertOk()->assertJsonFragment(['name' => 'Urgent']);

        // move term under parent (self check should fail)
        $this->postJson("/app/api/terms/{$termId}/move", ['parent_id' => $termId])->assertStatus(422);

        // update term name
        $this->patchJson("/app/api/terms/{$termId}", ['name' => 'Critical'])->assertOk()->assertJsonFragment(['name' => 'Critical']);

        // delete term
        $this->deleteJson("/app/api/terms/{$termId}")->assertNoContent();

        // delete taxonomy (now empty)
        $this->deleteJson("/app/api/taxonomies/{$taxonomyId}")->assertNoContent();
    }
}
