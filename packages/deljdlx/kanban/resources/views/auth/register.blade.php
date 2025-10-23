@extends('kanban::layouts.tabler', [ 'title' => 'Créer un compte' ])

@section('content')
    @if ($errors->any())
        <div class="alert alert-danger" role="alert">
            <div class="d-flex">
                <div>
                    <i class="ti ti-alert-triangle"></i>
                </div>
                <div>
                    <h4 class="alert-title">{{ __('There were some problems with your input.') }}</h4>
                    <div class="text-secondary">{{ $errors->first() }}</div>
                </div>
            </div>
        </div>
    @endif

    <form method="POST" action="{{ route('kanban.register.store') }}" class="">
        @csrf
        <div class="mb-3">
            <label class="form-label">{{ __('Name') }}</label>
            <input type="text" name="name" value="{{ old('name') }}" class="form-control" required autofocus>
        </div>
        <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" name="email" value="{{ old('email') }}" class="form-control" placeholder="name@example.com" required>
        </div>
        <div class="mb-3">
            <label class="form-label">{{ __('Password') }}</label>
            <input type="password" name="password" class="form-control" required>
        </div>
        <div class="mb-3">
            <label class="form-label">{{ __('Confirm Password') }}</label>
            <input type="password" name="password_confirmation" class="form-control" required>
        </div>
        <div class="form-footer">
            <button type="submit" class="btn btn-primary w-100">{{ __('Create account') }}</button>
        </div>
    </form>

    <div class="hr-text">{{ __('or') }}</div>
    <div class="text-center text-secondary">
        {{ __('Already registered?') }} <a href="{{ route('kanban.login') }}" tabindex="-1">{{ __('Sign in') }}</a>
    </div>
@endsection
