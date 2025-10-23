@extends('kanban::layouts.tabler', [ 'title' => 'Connexion' ])

@section('content')
    @if ($errors->any())
        <div class="alert alert-danger" role="alert">
            <div class="d-flex">
                <div>
                    <i class="ti ti-alert-triangle"></i>
                </div>
                <div>
                    <h4 class="alert-title">{{ __('auth.failed') }}</h4>
                    <div class="text-secondary">{{ $errors->first() }}</div>
                </div>
            </div>
        </div>
    @endif

    <form method="POST" action="{{ route('kanban.login.store') }}" class="">
        @csrf
        <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" name="email" value="{{ old('email') }}" class="form-control" placeholder="name@example.com" required autofocus>
        </div>
        <div class="mb-2">
            <label class="form-label">{{ __('Password') }}
                <span class="form-label-description">
                    <a href="#" onclick="return false;">{{ __('Forgot password?') }}</a>
                </span>
            </label>
            <div class="input-group input-group-flat">
                <input type="password" name="password" class="form-control" placeholder="••••••••" autocomplete="current-password" required>
            </div>
        </div>
        <div class="mb-2">
            <label class="form-check">
                <input type="checkbox" name="remember" value="1" class="form-check-input" />
                <span class="form-check-label">{{ __('Remember me') }}</span>
            </label>
        </div>
        <div class="form-footer">
            <button type="submit" class="btn btn-primary w-100">{{ __('Sign in') }}</button>
        </div>
    </form>

    <div class="hr-text">{{ __('or') }}</div>
    <div class="text-center text-secondary">
        {{ __('Don’t have account yet?') }} <a href="{{ route('kanban.register') }}" tabindex="-1">{{ __('Sign up') }}</a>
    </div>
@endsection
