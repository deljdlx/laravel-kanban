@if(!$selectedTaxonomy)
    <div class="text-secondary">Aucune sélection.</div>
@else
    @if($selectedTerms->isEmpty())
        <div id="noTermsState" class="text-secondary">Aucun terme.</div>
    @else
        <div id="noTermsState" class="text-secondary d-none">Aucun terme.</div>
        <div id="selectedTermsList" class="list-group list-group-flush">
            @foreach($selectedTerms as $t)
                <div class="list-group-item d-flex align-items-center" data-term-row data-term-id="{{ $t->id }}">
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
                    <div class="ms-2">
                        <button class="btn btn-outline-danger btn-icon btn-sm" title="Supprimer" data-bs-toggle="tooltip"
                                data-term-id="{{ $t->id }}" data-term-name="{{ e($t->name) }}" onclick="openDeleteTermModalFromEl(this)">
                            <i class="ti ti-trash"></i>
                        </button>
                    </div>
                </div>
            @endforeach
        </div>
    @endif
@endif
