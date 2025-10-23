@extends('kanban::layouts.tabler-app', [ 'title' => 'Kanban - Showcase', 'pageTitle' => 'Showcase Tabler' ])

@section('content')
    <div class="row row-cards">
        @foreach($kpis as $k)
            <div class="col-sm-6 col-lg-3">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="subheader">{{ $k['label'] }}</div>
                            <div class="ms-auto">
                                <span class="badge bg-{{ $k['color'] }}-lt">{{ $k['delta'] }}</span>
                            </div>
                        </div>
                        <div class="d-flex align-items-baseline">
                            <div class="h1 mb-3 me-2">{{ $k['value'] }}</div>
                            <div class="ms-auto">
                                <i class="{{ $k['icon'] }} text-{{ $k['color'] }}" style="font-size: 28px"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    <div class="row row-cards mt-3">
        <div class="col-lg-8">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">{{ __('Activity') }}</h3>
                </div>
                <div class="card-body">
                    <div class="divide-y">
                        @foreach($activities as $a)
                            <div class="row py-3 align-items-center">
                                <div class="col-auto">
                                    <span class="avatar">{{ $a['avatar'] }}</span>
                                </div>
                                <div class="col">
                                    <div><strong>{{ $a['user'] }}</strong> {{ $a['action'] }} <strong>{{ $a['target'] }}</strong></div>
                                    <div class="text-secondary">{{ $a['time'] }}</div>
                                </div>
                                <div class="col-auto">
                                    <span class="badge bg-{{ $a['badge']['color'] }}-lt">{{ $a['badge']['text'] }}</span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">{{ __('Recent tickets') }}</h3>
                    <div class="card-actions">
                        <a href="#" class="btn btn-sm" onclick="Tabler.Toast.show('Export en cours'); return false;">Export</a>
                        <a href="#" class="btn btn-sm btn-primary" onclick="document.getElementById('newTicketModal').showModal(); return false;">Nouveau</a>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-vcenter">
                        <thead>
                        <tr>
                            <th>{{ __('Title') }}</th>
                            <th>{{ __('Owner') }}</th>
                            <th>{{ __('Status') }}</th>
                            <th>{{ __('Progress') }}</th>
                            <th class="w-1"></th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach($projects as $p)
                            <tr>
                                <td>{{ $p['title'] }}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <span class="avatar me-2">{{ strtoupper(substr($p['owner'],0,1)) }}</span>
                                        <span>{{ $p['owner'] }}</span>
                                    </div>
                                </td>
                                <td><span class="badge bg-{{ $p['status']['color'] }}-lt">{{ $p['status']['text'] }}</span></td>
                                <td>
                                    <div class="progress progress-sm">
                                        <div class="progress-bar" style="width: {{ $p['progress'] }}%" role="progressbar" aria-valuenow="{{ $p['progress'] }}" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                </td>
                                <td class="text-secondary">{{ $p['updated'] }}</td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">{{ __('Team') }}</h3>
                </div>
                <div class="card-body">
                    <div class="avatars-stack">
                        @foreach($team as $t)
                            <span class="avatar" data-bs-toggle="tooltip" title="{{ $t['name'] }}">{{ $t['initial'] }}</span>
                        @endforeach
                    </div>
                </div>
            </div>
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">Mini Kanban</h3>
                </div>
                <div class="card-body">
                    <div class="row g-2">
                        @foreach($miniKanban as $col)
                            <div class="col-6">
                                <div class="card card-sm">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center mb-2">
                                            <div class="me-auto">{{ $col['name'] }}</div>
                                            <span class="badge bg-secondary-lt">{{ $col['count'] }}</span>
                                        </div>
                                        @foreach($col['tickets'] as $t)
                                            <div class="mb-1">
                                                <span class="status-dot status-{{ match($t['label']) { 'bug' => 'red', 'feature' => 'green', 'docs' => 'blue', 'chore' => 'gray', default => 'secondary' } }}"></span>
                                                {{ $t['title'] }}
                                            </div>
                                        @endforeach
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
            <div class="card mt-3">
                <div class="card-body">
                    <div class="btn-list">
                        <a class="btn btn-primary" href="{{ route('kanban.login') }}">{{ __('Sign in') }}</a>
                        <a class="btn btn-outline-primary" href="{{ route('kanban.register') }}">{{ __('Sign up') }}</a>
                        <a class="btn" href="{{ route('kanban.dashboard') }}">{{ __('Dashboard') }}</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <dialog id="newTicketModal" class="modal modal-blur">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Nouveau ticket</h5>
                    <button type="button" class="btn-close" onclick="this.closest('dialog').close()"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-2"><input type="text" class="form-control" placeholder="Titre"></div>
                    <div><textarea class="form-control" rows="3" placeholder="Description"></textarea></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-link" onclick="this.closest('dialog').close()">Annuler</button>
                    <button type="button" class="btn btn-primary" onclick="Tabler.Toast.show('Créé (démo)'); this.closest('dialog').close()">Créer</button>
                </div>
            </div>
        </div>
    </dialog>

    <script>
        window.Tabler = window.Tabler || {};
        Tabler.Toast = Tabler.Toast || {
            show(msg){
                const toast = document.createElement('div');
                toast.className = 'toast show position-fixed bottom-0 end-0 m-3';
                toast.innerHTML = `<div class="toast-header"><strong class="me-auto">Info</strong><button type="button" class="btn-close" data-bs-dismiss="toast"></button></div><div class="toast-body">${msg}</div>`;
                document.body.appendChild(toast);
                setTimeout(()=>toast.remove(), 2500);
            }
        };
    </script>
@endsection
