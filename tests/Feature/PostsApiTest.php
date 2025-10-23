<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_crud_post(): void
    {
        // create
        $resp = $this->postJson('/app/api/posts', [
            'title' => 'First',
            'content' => 'Body',
            'published' => true,
        ]);
        $resp->assertCreated();
        $id = $resp->json('id');

        // index
        $this->getJson('/app/api/posts')->assertOk()->assertJsonFragment(['title' => 'First']);

        // show
        $this->getJson("/app/api/posts/{$id}")->assertOk()->assertJsonFragment(['content' => 'Body']);

        // update
        $this->patchJson("/app/api/posts/{$id}", ['title' => 'Updated'])->assertOk()->assertJsonFragment(['title' => 'Updated']);

        // delete
        $this->deleteJson("/app/api/posts/{$id}")->assertNoContent();
        $this->getJson("/app/api/posts/{$id}")->assertNotFound();
    }
}
