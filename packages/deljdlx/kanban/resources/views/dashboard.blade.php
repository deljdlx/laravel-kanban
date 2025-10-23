@extends('kanban::layouts.tabler-app', [ 'title' => 'Kanban', 'pageTitle' => 'Tableau de bord' ])

@section('content')
    <div class="row row-cards">
        @foreach($stats as $s)
            <div class="col-sm-6 col-lg-3">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="subheader">{{ $s['label'] }}</div>
                        </div>
                        <div class="d-flex align-items-baseline">
                            <div class="h1 mb-0 me-2">{{ $s['value'] }}</div>
                            <div class="me-auto">
                                <span class="text-{{ str_starts_with($s['delta'], '+') ? 'green' : (str_starts_with($s['delta'], '-') ? 'red' : 'secondary') }} d-inline-flex align-items-center">
                                  {{ $s['delta'] }}
                                </span>
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
                    <div class="text-secondary">{{ __('No recent activity. Start by creating tickets!') }}</div>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">{{ __('Today') }}</h3>
                </div>
                <div class="card-body">
                    <div class="text-secondary">{{ $today->format('d/m/Y H:i') }}</div>
                </div>
            </div>
        </div>
    </div>
@endsection
