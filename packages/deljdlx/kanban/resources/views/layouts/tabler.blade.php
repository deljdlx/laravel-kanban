<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? config('app.name', 'Kanban') }}</title>
    <link href="https://unpkg.com/@tabler/core@1.0.0-beta20/dist/css/tabler.min.css" rel="stylesheet" />
    <link href="https://unpkg.com/@tabler/icons-webfont@latest/tabler-icons.min.css" rel="stylesheet" />
    <style>
        body { display:flex; min-height:100vh; background: #f5f7fb; }
        .auth-wrapper { margin:auto; width:100%; max-width: 420px; padding: 24px; }
    </style>
    @stack('head')
    @vite(['resources/css/app.css','resources/js/app.js'])
    @filamentStyles
    @livewireStyles
    @stack('styles')
    @stack('scripts-head')
    @stack('scripts-head-inline')
</head>
<body>
<div class="auth-wrapper">
    <div class="card card-md">
        @isset($header)
            <div class="card-header"><h2 class="card-title">{{ $header }}</h2></div>
        @endisset
        <div class="card-body">
            {{ $slot ?? '' }}
            @yield('content')
        </div>
    </div>
    @isset($footer)
        <div class="text-center text-secondary mt-3">
            {{ $footer }}
        </div>
    @endisset
</div>
@filamentScripts
@livewireScripts
@stack('body')
@stack('scripts')
</body>
</html>
