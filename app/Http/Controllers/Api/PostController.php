<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     * exemple /app/api/pharmacies?per_page=25&page=2
     */
    public function index(Request $request)
    {
        // return Post::all();

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

        $paginator = QueryBuilder::for(Post::query())
            ->allowedFilters([
                AllowedFilter::exact('id'),
            ])
            // ->allowedIncludes(['connexions'])
            // ->allowedSorts(['id', 'code_client', 'code_postal', 'actif'])
            ->defaultSort('id')
            // ->select(['id', 'code_client', 'code_postal', 'actif'])
            ->paginate($perPage)
            ->appends($request->query());

        return response()->json($paginator);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required','string','max:255'],
            'content' => ['nullable','string'],
            'published' => ['sometimes','boolean'],
        ]);
        $post = Post::create([
            'title' => $data['title'],
            'content' => $data['content'] ?? null,
            'published' => (bool)($data['published'] ?? false),
        ]);
        return response()->json($post, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return response()->json($post);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        $data = $request->validate([
            'title' => ['sometimes','string','max:255'],
            'content' => ['sometimes','nullable','string'],
            'published' => ['sometimes','boolean'],
        ]);
        $post->fill($data);
        $post->save();
        return response()->json($post);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        $post->delete();
        return response()->json(status: 204);
    }
}
