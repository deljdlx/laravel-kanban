@extends('kanban::layouts.tabler-app', [ 'title' => 'Taxonomy', 'pageTitle' => $taxonomy->name ])

@section('content')
    <div class="row g-3">
        <div class="col-12">
            <div class="card">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <div class="h2 mb-1 d-flex align-items-center gap-2">
                            @if($taxonomy->icon)
                                <i class="ti {{ $taxonomy->icon }} text-secondary"></i>
                            @else
                                <i class="ti ti-category text-secondary"></i>
                            @endif
                            <span>{{ $taxonomy->name }}</span>
                            <code class="text-secondary">{{ $taxonomy->slug }}</code>
                        </div>
                        <div class="text-secondary">
                            Scope: <strong>{{ $taxonomy->scope ?? '—' }}</strong>
                            <span class="mx-2">•</span>
                            Type: {{ $taxonomy->hierarchical ? 'Hierarchical' : 'Flat' }}
                        </div>
                        @if($taxonomy->description)
                            <div class="mt-2">{{ $taxonomy->description }}</div>
                        @endif
                    </div>
                    <div>
                        <a href="{{ route('kanban.taxonomies', ['scope' => $taxonomy->scope]) }}" class="btn btn-outline-secondary">
                            <i class="ti ti-arrow-left me-1"></i>Retour
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title mb-0">Terms ({{ $terms->count() }})</h3>
                </div>
                <div class="card-body">
                    @if($terms->isEmpty())
                        <div class="text-secondary">Aucun terme.</div>
                    @else
                        <div class="list-group list-group-flush">
                            @foreach($terms as $t)
                                <div class="list-group-item d-flex align-items-center">
                                    <div class="me-2 text-secondary" style="min-width: {{ max(0, ($t->depth ?? 0)) * 16 }}px">
                                        @for($i=0;$i<($t->depth ?? 0);$i++)<span class="text-secondary">•</span>@endfor
                                    </div>
                                    <div class="flex-fill">
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="fw-semibold">{{ $t->name }}</span>
                                            <code class="text-secondary">{{ $t->slug }}</code>
                                            @if(($t->usage_count ?? 0) > 0)
                                                <span class="badge bg-secondary" title="Usage count">{{ $t->usage_count }}</span>
                                            @endif
                                        </div>
                                        @if($t->description)
                                            <div class="small text-secondary">{{ $t->description }}</div>
                                        @endif
                                        <div class="small text-secondary">path: {{ $t->path }} • depth: {{ $t->depth }}</div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
@endsection
