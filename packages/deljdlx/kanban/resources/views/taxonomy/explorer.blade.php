@extends('kanban::layouts.tabler-app', [ 'title' => 'Taxonomies', 'pageTitle' => 'Taxonomies Explorer' ])

@section('content')
    <div class="row g-3">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <form method="get" class="row g-2 align-items-end">
                        <div class="col-md-3">
                            <label class="form-label">Scope</label>
                            <select name="scope" class="form-select" onchange="this.form.submit()">
                                @foreach($scopes as $s)
                                    <option value="{{ $s }}" @selected($s === $scope)>{{ $s }}</option>
                                @endforeach
                            </select>
                            <div class="form-text">Slug du scope: <code id="scopeSlugPreview">{{ $scope }}</code></div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Recherche</label>
                            <div class="input-icon">
                                <span class="input-icon-addon"><i class="ti ti-search"></i></span>
                                <input type="text" name="q" value="{{ $q }}" class="form-control" placeholder="Nom ou slug…" />
                            </div>
                        </div>
                        <div class="col-md-3 text-end">
                            <button class="btn btn-primary"><i class="ti ti-filter me-1"></i>Filtrer</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="row g-3">
                <div class="col-12 col-lg-4 col-xl-3">
                    <div class="card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h3 class="card-title mb-0">Taxonomies</h3>
                            <button type="button" id="openAddTaxonomyBtn" class="btn btn-primary btn-sm">
                                <i class="ti ti-plus me-1"></i>Nouvelle taxonomy
                            </button>
                        </div>
                        <div class="list-group list-group-flush" id="taxonomyList">
                            @forelse($taxonomies as $tx)
                                @php($active = $selectedSlug === $tx->slug)
                                          <a href="{{ route('kanban.taxonomies', ['scope' => $scope, 'q' => $q, 'slug' => $tx->slug]) }}"
                                              data-slug="{{ $tx->slug }}"
                                             data-taxonomy-id="{{ $tx->id }}"
                                              data-name="{{ $tx->name }}"
                                              @if($tx->icon) data-icon="{{ $tx->icon }}" @endif
                                              data-hierarchical="{{ $tx->hierarchical ? '1' : '0' }}"
                                   class="taxonomy-link list-group-item list-group-item-action d-flex justify-content-between align-items-center @if($active) active @endif">
                                    <div class="d-flex align-items-center gap-2">
                                        @if($tx->icon)
                                            <i class="ti {{ $tx->icon }}"></i>
                                        @else
                                            <i class="ti ti-category"></i>
                                        @endif
                                        <span>{{ $tx->name }}</span>
                                        <code class="text-secondary">{{ $tx->slug }}</code>
                                    </div>
                                    <span class="badge @if($tx->hierarchical) bg-blue @else bg-green @endif">
                                        {{ $tx->hierarchical ? 'Tree' : 'Tags' }}
                                    </span>
                                </a>
                            @empty
                                <div class="list-group-item text-secondary">Aucune taxonomy.</div>
                            @endforelse
                        </div>
                    </div>
                </div>
                <div class="col-12 col-lg-8 col-xl-9">
                    <div class="card h-100">
                        <div id="detailHeader" class="card-header d-flex justify-content-between align-items-center" @if($selectedTaxonomy) data-taxonomy-id="{{ $selectedTaxonomy->id }}" @endif>
                            <div>
                                @if($selectedTaxonomy)
                                    <div class="h3 mb-0 d-flex align-items-center gap-2">
                                        @php($icon = $selectedTaxonomy?->icon)
                                        <i id="selectedTaxonomyIcon" class="ti {{ $icon ? $icon : 'ti-category' }} text-secondary"></i>
                                        <span id="selectedTaxonomyName">{{ $selectedTaxonomy->name }}</span>
                                        <code id="selectedTaxonomySlug" class="text-secondary">{{ $selectedTaxonomy->slug }}</code>
                                    </div>
                                    <div class="small text-secondary">
                                        Scope: <span id="selectedTaxonomyScope">{{ $selectedTaxonomy->scope ?? '—' }}</span>
                                        <span class="mx-2">•</span>
                                        <span id="selectedTaxonomyType">{{ $selectedTaxonomy->hierarchical ? 'Hierarchical' : 'Flat' }}</span>
                                        <span class="mx-2">•</span>
                                        Terms: <span id="selectedTermsCount">{{ $selectedTerms->count() }}</span>
                                    </div>
                                @else
                                    <div class="text-secondary">Sélectionnez une taxonomy dans la liste de gauche.</div>
                                @endif
                            </div>
                            <div class="d-flex gap-2">
                                <button type="button" id="openAddTermBtn" class="btn btn-primary" @if(!$selectedTaxonomy) disabled @endif>
                                    <i class="ti ti-plus me-1"></i>Ajouter un terme
                                </button>
                                @if($selectedTaxonomy)
                                    <a id="selectedOpenBtn" href="{{ route('kanban.taxonomies.show.slug', ['scope' => $selectedTaxonomy->scope ?? 'global', 'slug' => $selectedTaxonomy->slug]) }}" class="btn btn-outline-secondary">
                                        Ouvrir la page
                                    </a>
                                @else
                                    <a id="selectedOpenBtn" href="#" class="btn btn-outline-secondary disabled" tabindex="-1" aria-disabled="true">Ouvrir la page</a>
                                @endif
                            </div>
                        </div>
                        <div id="detailBody" class="card-body" @if($selectedTaxonomy) data-taxonomy-id="{{ $selectedTaxonomy->id }}" @endif>
                            @include('kanban::taxonomy.partials.explorer-detail')
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
    const TERM_API_PREFIX = @json(rtrim(config('taxonomy.route_prefix', 'app/api'), '/'));
    const TAXO_API_PREFIX = TERM_API_PREFIX; // same prefix
    const KANBAN_PREFIX = @json('/' . trim(config('kanban.route_prefix', 'kanban'), '/'));
        let deleteModal, deleteModalEl, deleteConfirmBtn, deleteNameEl, deleteErrorEl;
        let pendingTermId = null;

        window.addEventListener('DOMContentLoaded', () => {
            // Wire AJAX navigation for taxonomy clicks
            const list = document.getElementById('taxonomyList');
            list?.addEventListener('click', async (e) => {
                const a = e.target.closest('a.taxonomy-link');
                if (!a) return;
                e.preventDefault();
                const href = new URL(a.getAttribute('href'), window.location.origin);
                href.searchParams.set('fragment', 'details');
                try {
                    // Loading state
                    const bodyEl = document.getElementById('detailBody');
                    const headerEl = document.getElementById('detailHeader');
                    bodyEl.innerHTML = '<div class="text-secondary">Chargement…</div>';

                    const resp = await fetch(href.toString(), { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
                    const html = await resp.text();
                    // Update active item
                    document.querySelectorAll('#taxonomyList a.taxonomy-link.active').forEach(el => el.classList.remove('active'));
                    a.classList.add('active');
                    // Swap detail body
                    bodyEl.innerHTML = html;
                    // Update taxonomy id on containers
                    const taxId = a.getAttribute('data-taxonomy-id');
                    if (taxId) {
                        bodyEl.setAttribute('data-taxonomy-id', taxId);
                        headerEl.setAttribute('data-taxonomy-id', taxId);
                    }

                    // Update header from dataset
                    const slug = a.getAttribute('data-slug');
                    const name = a.getAttribute('data-name') || '';
                    const icon = a.getAttribute('data-icon');
                    const hierarchical = a.getAttribute('data-hierarchical') === '1';

                    const nameEl = document.getElementById('selectedTaxonomyName');
                    const slugEl = document.getElementById('selectedTaxonomySlug');
                    const typeEl = document.getElementById('selectedTaxonomyType');
                    const scopeEl = document.getElementById('selectedTaxonomyScope');
                    const iconEl = document.getElementById('selectedTaxonomyIcon');
                    const openBtn = document.getElementById('selectedOpenBtn');

                    if (nameEl) nameEl.textContent = name;
                    if (slugEl) slugEl.textContent = slug || '';
                    if (typeEl) typeEl.textContent = hierarchical ? 'Hierarchical' : 'Flat';
                    if (scopeEl) {
                        const scopeSel = document.querySelector('select[name="scope"]');
                        scopeEl.textContent = scopeSel ? scopeSel.value : 'global';
                    }
                    if (iconEl) {
                        // reset to default then add icon class if any
                        iconEl.className = 'ti ' + (icon ? icon : 'ti-category') + ' text-secondary';
                    }
                    if (openBtn && slug) {
                        const scopeSel = document.querySelector('select[name="scope"]');
                        const scope = scopeSel ? scopeSel.value : 'global';
                        openBtn.setAttribute('href', KANBAN_PREFIX + '/scopes/' + encodeURIComponent(scope) + '/taxonomies/' + encodeURIComponent(slug));
                        openBtn.classList.remove('disabled');
                        openBtn.removeAttribute('aria-disabled');
                        openBtn.removeAttribute('tabindex');
                    }
                        // Add Term modal wiring

                    // Update terms count based on received DOM
                    const count = bodyEl.querySelectorAll('[data-term-row]').length;
                    const countEl = document.getElementById('selectedTermsCount');
                    if (countEl) countEl.textContent = String(count);
                    setAddEnabled(true);
                } catch (err) {
                    const bodyEl = document.getElementById('detailBody');
                    bodyEl.innerHTML = '<div class="text-danger">Erreur de chargement.</div>';
                    setAddEnabled(false);
                }
                // Update query string without reloading for deep-linking
                const fullHref = new URL(a.getAttribute('href'), window.location.origin);
                window.history.replaceState({}, '', fullHref.pathname + fullHref.search);
            });
            // Add Term modal wiring
            const addModalEl = document.getElementById('addTermModal');
            let addModal = addModalEl ? new bootstrap.Modal(addModalEl) : null;
            const openAddBtn = document.getElementById('openAddTermBtn');
            const addForm = document.getElementById('addTermForm');
            const addErrorEl = document.getElementById('addTermError');
            const addSubmitBtn = document.getElementById('confirmAddTermBtn');
            const addNameInput = document.getElementById('addTermName');
            const addSlugInput = document.getElementById('addTermSlug');
            const addDescInput = document.getElementById('addTermDescription');
            const slugPreview = document.getElementById('slugPreview');
            const slugStatus = document.getElementById('slugStatus');
            let slugCheckTimer = null;

            function toSlug(str) {
                return (str || '').toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                    .substring(0, 255);
            }

            function setSlugStatus(state) {
                // state: 'idle' | 'checking' | 'ok' | 'taken'
                const i = slugStatus?.querySelector('i');
                if (!i) return;
                slugStatus.classList.remove('text-success','text-danger');
                if (state === 'ok') {
                    i.className = 'ti ti-check';
                    slugStatus.classList.add('text-success');
                } else if (state === 'taken') {
                    i.className = 'ti ti-x';
                    slugStatus.classList.add('text-danger');
                } else if (state === 'checking') {
                    i.className = 'ti ti-loader-2';
                } else {
                    i.className = 'ti ti-dots';
                }
            }

            async function checkSlugAvailability() {
                const bodyEl = document.getElementById('detailBody');
                const taxonomyId = bodyEl?.getAttribute('data-taxonomy-id');
                if (!taxonomyId) return;
                const slugInput = addSlugInput?.value?.trim();
                const nameInput = addNameInput?.value?.trim();
                const slug = slugInput !== '' ? slugInput : toSlug(nameInput || '');
                if (slugPreview) slugPreview.textContent = slug || '';
                if (!slug) { setSlugStatus('idle'); return; }
                setSlugStatus('checking');
                try {
                    const url = '/' + TERM_API_PREFIX + `/taxonomies/${encodeURIComponent(taxonomyId)}/terms/check-slug?slug=${encodeURIComponent(slug)}`;
                    const resp = await fetch(url, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
                    const data = await resp.json();
                    setSlugStatus(data?.available ? 'ok' : 'taken');
                    return !!data?.available;
                } catch (_) {
                    setSlugStatus('idle');
                    return false;
                }
            }

            function scheduleSlugCheck() {
                clearTimeout(slugCheckTimer);
                slugCheckTimer = setTimeout(checkSlugAvailability, 250);
            }

            addNameInput?.addEventListener('input', scheduleSlugCheck);
            addSlugInput?.addEventListener('input', scheduleSlugCheck);

            openAddBtn?.addEventListener('click', () => {
                addErrorEl?.classList.add('d-none');
                addForm?.reset();
                addModal?.show();
                setTimeout(() => addNameInput?.focus(), 150);
            });

            addForm?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const bodyEl = document.getElementById('detailBody');
                const taxonomyId = bodyEl?.getAttribute('data-taxonomy-id');
                if (!taxonomyId) return;
                setAddingState(true);
                addErrorEl?.classList.add('d-none');
                try {
                    const payload = {
                        name: addNameInput?.value?.trim() || '',
                        slug: addSlugInput?.value?.trim() || null,
                        description: addDescInput?.value?.trim() || null,
                    };
                    if (!payload.name) {
                        throw new Error('Le nom est requis.');
                    }
                    // Optional guard: if status shows taken, block submit with message
                    if (slugStatus && slugStatus.classList.contains('text-danger')) {
                        throw new Error('Ce slug est déjà utilisé dans cette taxonomie.');
                    }
                    const resp = await fetch('/' + TERM_API_PREFIX + '/taxonomies/' + encodeURIComponent(taxonomyId) + '/terms', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify(payload)
                    });
                    if (!resp.ok) {
                        let msg = 'Erreur lors de la création';
                        try {
                            const data = await resp.json();
                            if (data?.errors?.slug?.length) {
                                msg = data.errors.slug[0];
                            } else if (data?.message) {
                                msg = data.message;
                            }
                        } catch (_) {
                            const text = await resp.text();
                            if (text) msg = text;
                        }
                        throw new Error(msg);
                    }
                    const term = await resp.json();
                    // Update DOM list (create list container if needed)
                    let listEl = document.getElementById('selectedTermsList');
                    const emptyEl = document.getElementById('noTermsState');
                    if (!listEl) {
                        listEl = document.createElement('div');
                        listEl.id = 'selectedTermsList';
                        listEl.className = 'list-group list-group-flush';
                        const body = document.getElementById('detailBody');
                        if (body) body.appendChild(listEl);
                    }
                    if (emptyEl) emptyEl.classList.add('d-none');
                    listEl.classList.remove('d-none');

                    const row = document.createElement('div');
                    row.className = 'list-group-item d-flex align-items-center';
                    row.setAttribute('data-term-row', '');
                    row.setAttribute('data-term-id', String(term.id));
                    const minw = Math.max(0, term.depth || 0) * 16;
                    row.innerHTML = `
                        <div class="me-2 text-secondary" style="min-width: ${minw}px">
                            ${Array.from({length: term.depth || 0}).map(() => '<span class="text-secondary">•</span>').join('')}
                        </div>
                        <div class="flex-fill">
                            <div class="d-flex align-items-center gap-2">
                                <span class="fw-semibold"></span>
                                <code class="text-secondary"></code>
                            </div>
                            ${term.description ? `<div class=\"small text-secondary\"></div>` : ''}
                            <div class="small text-secondary">path: <span class="t-path"></span> • depth: <span class="t-depth"></span></div>
                        </div>
                        <div class="ms-2">
                            <button class="btn btn-outline-danger btn-icon btn-sm" title="Supprimer" data-bs-toggle="tooltip"
                                    data-term-id="${term.id}" data-term-name="${escapeHtml(term.name)}" onclick="openDeleteTermModalFromEl(this)">
                                <i class="ti ti-trash"></i>
                            </button>
                        </div>
                    `;
                    row.querySelector('.fw-semibold').textContent = term.name;
                    row.querySelector('code.text-secondary').textContent = term.slug;
                    if (term.description) row.querySelector('.small.text-secondary').textContent = term.description;
                    row.querySelector('.t-path').textContent = term.path;
                    row.querySelector('.t-depth').textContent = String(term.depth || 0);
                    listEl.appendChild(row);

                    const countEl = document.getElementById('selectedTermsCount');
                    if (countEl) {
                        const current = parseInt(countEl.textContent || '0', 10) || 0;
                        countEl.textContent = String(current + 1);
                    }
                    addModal?.hide();
                } catch (e) {
                    if (addErrorEl) {
                        addErrorEl.textContent = (e && e.message) ? e.message : String(e);
                        addErrorEl.classList.remove('d-none');
                    }
                } finally {
                    setAddingState(false);
                }
            });

            function setAddEnabled(enabled) {
                const addBtn = document.getElementById('openAddTermBtn');
                if (addBtn) addBtn.disabled = !enabled;
            }

            function setAddingState(isAdding) {
                const addSubmitBtn = document.getElementById('confirmAddTermBtn');
                if (!addSubmitBtn) return;
                addSubmitBtn.disabled = isAdding;
                addSubmitBtn.innerHTML = isAdding ? '<span class="spinner-border spinner-border-sm me-2"></span>Ajout…' : '<i class="ti ti-plus me-1"></i>Ajouter';
            }

            function escapeHtml(str) {
                return (str || '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
            }

            // Create Taxonomy modal wiring
            const addTaxoModalEl = document.getElementById('addTaxonomyModal');
            let addTaxoModal = addTaxoModalEl ? new bootstrap.Modal(addTaxoModalEl) : null;
            const openAddTaxoBtn = document.getElementById('openAddTaxonomyBtn');
            const addTaxoForm = document.getElementById('addTaxonomyForm');
            const addTaxoErrorEl = document.getElementById('addTaxonomyError');
            const addTaxoSubmitBtn = document.getElementById('confirmAddTaxonomyBtn');
            const taxoNameInput = document.getElementById('taxonomyName');
            const taxoSlugInput = document.getElementById('taxonomySlug');
            const taxoScopeInput = document.getElementById('taxonomyScope');
            const taxoHierInput = document.getElementById('taxonomyHierarchical');
            const taxoSlugPreview = document.getElementById('taxonomySlugPreview');
            const taxoSlugStatus = document.getElementById('taxonomySlugStatus');
            let taxoSlugTimer = null;

            openAddTaxoBtn?.addEventListener('click', () => {
                addTaxoErrorEl?.classList.add('d-none');
                addTaxoForm?.reset();
                // set default scope from selector
                const scopeSel = document.querySelector('select[name="scope"]');
                if (scopeSel && taxoScopeInput) taxoScopeInput.value = scopeSel.value || '';
                addTaxoModal?.show();
                setTimeout(() => taxoNameInput?.focus(), 150);
            });

            function setTaxoSlugStatus(state) {
                const i = taxoSlugStatus?.querySelector('i');
                if (!i) return;
                taxoSlugStatus.classList.remove('text-success','text-danger');
                if (state === 'ok') { i.className = 'ti ti-check'; taxoSlugStatus.classList.add('text-success'); }
                else if (state === 'taken') { i.className = 'ti ti-x'; taxoSlugStatus.classList.add('text-danger'); }
                else if (state === 'checking') { i.className = 'ti ti-loader-2'; }
                else { i.className = 'ti ti-dots'; }
            }

            async function checkTaxoSlug() {
                const slugInput = taxoSlugInput?.value?.trim();
                const nameInput = taxoNameInput?.value?.trim();
                const slug = slugInput !== '' ? slugInput : toSlug(nameInput || '');
                if (taxoSlugPreview) taxoSlugPreview.textContent = slug || '';
                if (!slug) { setTaxoSlugStatus('idle'); return; }
                setTaxoSlugStatus('checking');
                try {
                    const scopeSel = document.querySelector('select[name="scope"]');
                    const scope = scopeSel ? scopeSel.value : '';
                    const url = '/' + TAXO_API_PREFIX + `/taxonomies/check-slug?slug=${encodeURIComponent(slug)}&scope=${encodeURIComponent(scope)}`;
                    const resp = await fetch(url, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
                    const data = await resp.json();
                    setTaxoSlugStatus(data?.available ? 'ok' : 'taken');
                } catch (_) { setTaxoSlugStatus('idle'); }
            }

            function scheduleTaxoSlugCheck() {
                clearTimeout(taxoSlugTimer);
                taxoSlugTimer = setTimeout(checkTaxoSlug, 250);
            }

            taxoNameInput?.addEventListener('input', scheduleTaxoSlugCheck);
            taxoSlugInput?.addEventListener('input', scheduleTaxoSlugCheck);

            addTaxoForm?.addEventListener('submit', async (e) => {
                e.preventDefault();
                addTaxoErrorEl?.classList.add('d-none');
                const payload = {
                    name: taxoNameInput?.value?.trim() || '',
                    slug: taxoSlugInput?.value?.trim() || null,
                    scope: taxoScopeInput?.value?.trim() || null,
                    hierarchical: !!taxoHierInput?.checked,
                };
                if (!payload.name) {
                    addTaxoErrorEl.textContent = 'Le nom est requis.';
                    addTaxoErrorEl.classList.remove('d-none');
                    return;
                }
                if (taxoSlugStatus && taxoSlugStatus.classList.contains('text-danger')) {
                    addTaxoErrorEl.textContent = 'Ce slug est déjà utilisé.';
                    addTaxoErrorEl.classList.remove('d-none');
                    return;
                }
                addTaxoSubmitBtn.disabled = true;
                addTaxoSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Création…';
                try {
                    const resp = await fetch('/' + TAXO_API_PREFIX + '/taxonomies', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify(payload)
                    });
                    if (!resp.ok) {
                        let msg = 'Erreur lors de la création';
                        try {
                            const data = await resp.json();
                            if (data?.errors?.slug?.length) msg = data.errors.slug[0];
                            else if (data?.message) msg = data.message;
                        } catch (_) {
                            const text = await resp.text(); if (text) msg = text;
                        }
                        throw new Error(msg);
                    }
                    const taxo = await resp.json();
                    // Inject into left list at top (simple UX)
                    const list = document.getElementById('taxonomyList');
                    if (list) {
                        const a = document.createElement('a');
                        const hrefTemplate = KANBAN_PREFIX + '/taxonomies?scope=SCOPE&q=&slug=SLUG';
                        a.href = hrefTemplate
                            .replace('SCOPE', encodeURIComponent(taxo.scope || 'global'))
                            .replace('SLUG', encodeURIComponent(taxo.slug));
                        a.className = 'taxonomy-link list-group-item list-group-item-action d-flex justify-content-between align-items-center';
                        a.setAttribute('data-slug', taxo.slug);
                        a.setAttribute('data-taxonomy-id', taxo.id);
                        a.setAttribute('data-name', taxo.name);
                        if (taxo.icon) a.setAttribute('data-icon', taxo.icon);
                        a.setAttribute('data-hierarchical', taxo.hierarchical ? '1' : '0');
                        a.innerHTML = `
                            <div class="d-flex align-items-center gap-2">
                                <i class="ti ${taxo.icon || 'ti-category'}"></i>
                                <span>${escapeHtml(taxo.name)}</span>
                                <code class="text-secondary">${escapeHtml(taxo.slug)}</code>
                            </div>
                            <span class="badge ${taxo.hierarchical ? 'bg-blue' : 'bg-green'}">${taxo.hierarchical ? 'Tree' : 'Tags'}</span>
                        `;
                        list.prepend(a);
                        // Option: auto-cliquer pour charger détails
                        a.click();
                    }
                    addTaxoModal?.hide();
                } catch (e) {
                    addTaxoErrorEl.textContent = (e && e.message) ? e.message : String(e);
                    addTaxoErrorEl.classList.remove('d-none');
                } finally {
                    addTaxoSubmitBtn.disabled = false;
                    addTaxoSubmitBtn.innerHTML = '<i class="ti ti-plus me-1"></i>Créer';
                }
            });

            // Existing delete modal wiring
            deleteModalEl = document.getElementById('confirmDeleteTermModal');
            if (!deleteModalEl) return;
            deleteModal = new bootstrap.Modal(deleteModalEl);
            deleteConfirmBtn = document.getElementById('confirmDeleteTermBtn');
            deleteNameEl = document.getElementById('deleteTermName');
            deleteErrorEl = document.getElementById('deleteTermError');

            deleteConfirmBtn?.addEventListener('click', async () => {
                if (!pendingTermId) return;
                setDeletingState(true);
                deleteErrorEl.classList.add('d-none');
                try {
                    const resp = await fetch('/' + TERM_API_PREFIX + '/terms/' + pendingTermId, {
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });
                    if (!resp.ok) {
                        const text = await resp.text();
                        throw new Error(text || 'Erreur inconnue');
                    }
                    // Mise à jour UX sans rechargement
                    deleteModal.hide();
                    const row = document.querySelector(`[data-term-row][data-term-id="${pendingTermId}"]`);
                    if (row && row.parentElement) {
                        row.parentElement.removeChild(row);
                    }
                    const countEl = document.getElementById('selectedTermsCount');
                    if (countEl) {
                        const current = parseInt(countEl.textContent || '0', 10) || 0;
                        const next = Math.max(0, current - 1);
                        countEl.textContent = String(next);
                        const listEl = document.getElementById('selectedTermsList');
                        const emptyEl = document.getElementById('noTermsState');
                        if (next === 0) {
                            if (listEl) listEl.classList.add('d-none');
                            if (emptyEl) emptyEl.classList.remove('d-none');
                        }
                    }
                } catch (e) {
                    deleteErrorEl.textContent = 'Suppression impossible: ' + (e?.message ?? e);
                    deleteErrorEl.classList.remove('d-none');
                } finally {
                    setDeletingState(false);
                }
            });
        });

        function openDeleteTermModal(term) {
            pendingTermId = term.id;
            if (deleteNameEl) deleteNameEl.textContent = term.name || ('#' + term.id);
            deleteErrorEl?.classList.add('d-none');
            deleteModal?.show();
        }

        function openDeleteTermModalFromEl(el) {
            const id = Number(el.getAttribute('data-term-id'));
            const name = el.getAttribute('data-term-name') || '';
            openDeleteTermModal({ id, name });
        }

        function setDeletingState(isDeleting) {
            if (!deleteConfirmBtn) return;
            deleteConfirmBtn.disabled = isDeleting;
            deleteConfirmBtn.innerHTML = isDeleting ? '<span class="spinner-border spinner-border-sm me-2"></span>Suppression…' : '<i class="ti ti-trash me-1"></i>Supprimer';
        }
    </script>

    <!-- Tabler Modal: confirm delete term -->
    <div class="modal modal-blur fade" id="confirmDeleteTermModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirmer la suppression</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="text-secondary">Voulez-vous vraiment supprimer le terme <strong id="deleteTermName"></strong> ? Cette action est irréversible.</div>
                    <div id="deleteTermError" class="alert alert-danger d-none mt-2"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="button" id="confirmDeleteTermBtn" class="btn btn-danger"><i class="ti ti-trash me-1"></i>Supprimer</button>
                </div>
            </div>
        </div>
    </div>
@endpush

@push('scripts')
    <!-- Tabler Modal: add term -->
    <div class="modal modal-blur fade" id="addTermModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Ajouter un terme</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="addTermForm">
                    <div class="modal-body">
                        <div id="addTermError" class="alert alert-danger d-none mb-3"></div>
                        <div class="mb-3">
                            <label class="form-label">Nom <span class="text-danger">*</span></label>
                            <input type="text" id="addTermName" class="form-control" required />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Slug (optionnel)</label>
                            <div class="input-group">
                                <input type="text" id="addTermSlug" class="form-control" placeholder="auto-généré si vide" />
                                <span class="input-group-text" id="slugStatus" title="Disponibilité">
                                    <i class="ti ti-dots"></i>
                                </span>
                            </div>
                            <div class="form-text">Prévisualisation: <code id="slugPreview"></code></div>
                        </div>
                        <div class="mb-0">
                            <label class="form-label">Description (optionnel)</label>
                            <textarea id="addTermDescription" class="form-control" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="submit" id="confirmAddTermBtn" class="btn btn-primary"><i class="ti ti-plus me-1"></i>Ajouter</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endpush

@push('scripts')
    <!-- Tabler Modal: create taxonomy -->
    <div class="modal modal-blur fade" id="addTaxonomyModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Nouvelle taxonomy</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="addTaxonomyForm">
                    <div class="modal-body">
                        <div id="addTaxonomyError" class="alert alert-danger d-none mb-3"></div>
                        <div class="mb-3">
                            <label class="form-label">Nom <span class="text-danger">*</span></label>
                            <input type="text" id="taxonomyName" class="form-control" required />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Slug (optionnel)</label>
                            <div class="input-group">
                                <input type="text" id="taxonomySlug" class="form-control" placeholder="auto-généré si vide" />
                                <span class="input-group-text" id="taxonomySlugStatus" title="Disponibilité">
                                    <i class="ti ti-dots"></i>
                                </span>
                            </div>
                            <div class="form-text">Prévisualisation: <code id="taxonomySlugPreview"></code></div>
                        </div>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Scope</label>
                                <input type="text" id="taxonomyScope" class="form-control" placeholder="global, projet, …" />
                            </div>
                            <div class="col-md-6 d-flex align-items-center">
                                <label class="form-check m-0">
                                    <input class="form-check-input" type="checkbox" id="taxonomyHierarchical">
                                    <span class="form-check-label">Hiérarchique</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="submit" id="confirmAddTaxonomyBtn" class="btn btn-primary"><i class="ti ti-plus me-1"></i>Créer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endpush
