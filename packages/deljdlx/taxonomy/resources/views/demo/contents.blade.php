@extends('kanban::layouts.tabler-app', ['title' => 'Demo contents', 'pageTitle' => 'Taxonomy demo contents'])

@section('content')
<div class="row g-3">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h3 class="card-title mb-0">Derniers contenus démo (max 100)</h3>
                <a href="{{ route('taxonomy.demo.contents') }}" class="btn btn-outline-secondary">Rafraîchir</a>
            </div>
            <div class="list-group list-group-flush">
                @forelse($contents as $c)
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="fw-semibold">#{{ $c->id }} — {{ $c->title }}</div>
                                @if($c->body)
                                    <div class="text-secondary small">{{ Str::limit($c->body, 160) }}</div>
                                @endif
                            </div>
                            <div class="text-secondary small">{{ $c->created_at?->diffForHumans() }}</div>
                        </div>
                        <div class="mt-2">
                            @forelse($c->terms as $idx => $t)
                                <span class="badge me-1 {{ $t->pivot->is_primary ? 'bg-blue' : 'bg-secondary' }}" title="scope={{ $t->taxonomy->scope }} / {{ $t->taxonomy->slug }}">
                                    {{ $t->name }}
                                </span>
                            @empty
                                <span class="text-secondary">Aucun tag</span>
                            @endforelse
                        </div>
                    </div>
                @empty
                    <div class="list-group-item text-secondary">Aucun contenu démo.</div>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection
