@extends('kanban::layouts.tabler', [ 'title' => 'Mon compte' ])

@section('content')
    <div class="row row-cards">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">{{ __('Profile') }}</h3>
                </div>
                <div class="card-body">
                    <dl class="row">
                        <dt class="col-3">ID</dt>
                        <dd class="col-9">{{ $user?->id }}</dd>
                        <dt class="col-3">{{ __('Name') }}</dt>
                        <dd class="col-9">{{ $user?->name }}</dd>
                        <dt class="col-3">Email</dt>
                        <dd class="col-9">{{ $user?->email }}</dd>
                    </dl>
                </div>
            </div>
            <div class="text-center mt-3">
                <form method="POST" action="{{ route('kanban.logout') }}">
                    @csrf
                    <button class="btn btn-outline-danger" type="submit">{{ __('Logout') }}</button>
                </form>
            </div>
        </div>
    </div>
@endsection
