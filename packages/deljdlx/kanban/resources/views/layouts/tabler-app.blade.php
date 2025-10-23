<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? 'Kanban' }}</title>
    <link href="https://unpkg.com/@tabler/core@1.0.0-beta20/dist/css/tabler.min.css" rel="stylesheet" />
    <link href="https://unpkg.com/@tabler/icons-webfont@latest/tabler-icons.min.css" rel="stylesheet" />
    @vite(['resources/css/app.css','resources/js/app.js'])
    @filamentStyles
    @livewireStyles
    <style>
        body { background-color: #f5f7fb; }
    </style>
</head>
<body>
<div class="page">
    <header class="navbar navbar-expand-md d-print-none">
        <div class="container-xl">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu" aria-controls="navbar-menu" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <h1 class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
                <a href="{{ route('kanban.dashboard') }}" class="d-inline-flex align-items-center gap-2">
                    <i class="ti ti-layout-kanban" style="font-size: 1.25rem"></i>
                    <span class="navbar-brand-text">Kanban</span>
                </a>
            </h1>

            <div class="navbar-nav flex-row order-md-last align-items-center">
                <!-- Quick create -->
                <div class="nav-item dropdown me-2 d-none d-md-block">
                    <a href="#" class="btn btn-primary" data-bs-toggle="dropdown">
                        <i class="ti ti-plus me-1"></i><span class="d-none d-xl-inline">{{ __('New') }}</span>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                        <a class="dropdown-item" href="#"><i class="ti ti-layout-kanban me-2"></i>{{ __('New board') }}</a>
                        <a class="dropdown-item" href="#"><i class="ti ti-ticket me-2"></i>{{ __('New ticket') }}</a>
                        <a class="dropdown-item" href="#"><i class="ti ti-users me-2"></i>{{ __('New team') }}</a>
                    </div>
                </div>
                <!-- Theme toggle -->
                <div class="nav-item me-2">
                    <a href="#" class="nav-link px-2" id="themeToggle" title="Toggle theme" aria-label="Toggle theme">
                        <i class="ti ti-sun high-contrast d-none" id="icon-light"></i>
                        <i class="ti ti-moon" id="icon-dark"></i>
                    </a>
                </div>

                <!-- Notifications -->
                <div class="nav-item dropdown me-2">
                    <a href="#" class="nav-link px-2" data-bs-toggle="dropdown" aria-label="Show notifications">
                        <i class="ti ti-bell"></i>
                        <span class="badge bg-red"></span>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end dropdown-menu-card">
                        <div class="card">
                            <div class="card-header"><h3 class="card-title mb-0">{{ __('Notifications') }}</h3></div>
                            <div class="list-group list-group-flush list-group-hoverable">
                                <a class="list-group-item" href="#">
                                    <div class="row align-items-center">
                                        <div class="col-auto"><span class="status-dot status-green"></span></div>
                                        <div class="col text-truncate">{{ __('New ticket assigned to you') }}</div>
                                        <div class="col-auto text-secondary small">2m</div>
                                    </div>
                                </a>
                                <a class="list-group-item" href="#">
                                    <div class="row align-items-center">
                                        <div class="col-auto"><span class="status-dot status-blue"></span></div>
                                        <div class="col text-truncate">{{ __('Board name updated') }}</div>
                                        <div class="col-auto text-secondary small">1h</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                @auth
                    <div class="nav-item dropdown">
                        <a href="#" class="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown" aria-label="Open user menu">
                            <span class="avatar avatar-sm">{{ Str::of(auth()->user()->name ?? 'U')->substr(0,1)->upper() }}</span>
                            <div class="d-none d-xl-block ps-2">
                                <div class="fw-semibold">{{ auth()->user()->name }}</div>
                                <div class="mt-1 small text-secondary">{{ auth()->user()->email }}</div>
                            </div>
                        </a>
                        <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                            <a href="{{ route('kanban.me') }}" class="dropdown-item"><i class="ti ti-user me-2"></i>{{ __('Profile') }}</a>
                            <a href="{{ route('kanban.dashboard') }}" class="dropdown-item"><i class="ti ti-home me-2"></i>{{ __('Dashboard') }}</a>
                            <a href="{{ route('kanban.showcase') }}" class="dropdown-item"><i class="ti ti-apps me-2"></i>{{ __('Showcase') }}</a>
                            <div class="dropdown-divider"></div>
                            <form method="POST" action="{{ route('kanban.logout') }}" class="px-3">
                                @csrf
                                <button type="submit" class="btn btn-outline-danger w-100"><i class="ti ti-logout me-2"></i>{{ __('Logout') }}</button>
                            </form>
                        </div>
                    </div>
                @else
                    <div class="nav-item d-none d-md-flex">
                        <a href="{{ route('kanban.login') }}" class="btn btn-outline-primary mx-1"><i class="ti ti-login me-1"></i>{{ __('Sign in') }}</a>
                        <a href="{{ route('kanban.register') }}" class="btn btn-primary mx-1"><i class="ti ti-user-plus me-1"></i>{{ __('Sign up') }}</a>
                    </div>
                @endauth
            </div>
            <div class="collapse navbar-collapse" id="navbar-menu">
                <div class="d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link {{ request()->routeIs('kanban.dashboard') ? 'active' : '' }}" href="{{ route('kanban.dashboard') }}">
                                <span class="nav-link-icon d-md-none d-lg-inline-block"><i class="ti ti-home"></i></span>
                                <span class="nav-link-title">Dashboard</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link {{ request()->routeIs('kanban.showcase') ? 'active' : '' }}" href="{{ route('kanban.showcase') }}">
                                <span class="nav-link-icon d-md-none d-lg-inline-block"><i class="ti ti-apps"></i></span>
                                <span class="nav-link-title">Showcase</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link {{ request()->routeIs('kanban.taxonomies') ? 'active' : '' }}" href="{{ route('kanban.taxonomies') }}">
                                <span class="nav-link-icon d-md-none d-lg-inline-block"><i class="ti ti-category"></i></span>
                                <span class="nav-link-title">Taxonomies</span>
                            </a>
                        </li>
                        @auth
                            <li class="nav-item">
                                <a class="nav-link {{ request()->routeIs('kanban.me') ? 'active' : '' }}" href="{{ route('kanban.me') }}">
                                    <span class="nav-link-icon d-md-none d-lg-inline-block"><i class="ti ti-user"></i></span>
                                    <span class="nav-link-title">{{ __('Profile') }}</span>
                                </a>
                            </li>
                        @endauth
                    </ul>
                    <div class="ms-md-auto pe-md-3">
                        <div class="input-icon">
                            <span class="input-icon-addon"><i class="ti ti-search"></i></span>
                            <input type="text" class="form-control" placeholder="{{ __('Search…') }}" aria-label="Search" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
    <div class="page-wrapper">
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">{{ $pageTitle ?? ($title ?? 'Dashboard') }}</h2>
                        @isset($subtitle)
                            <div class="text-secondary">{{ $subtitle }}</div>
                        @endisset
                    </div>
                </div>
            </div>
        </div>
        <div class="page-body">
            <div class="container-xl">
                @yield('content')
            </div>
        </div>
        <footer class="footer footer-transparent d-print-none">
            <div class="container-xl">
                <div class="row text-center align-items-center flex-row-reverse">
                    <div class="col-lg-auto ms-lg-auto">
                        <ul class="list-inline list-inline-dots mb-0">
                            <li class="list-inline-item"><a href="#" class="link-secondary">Documentation</a></li>
                            <li class="list-inline-item"><a href="#" class="link-secondary">Support</a></li>
                        </ul>
                    </div>
                    <div class="col-12 col-lg-auto mt-3 mt-lg-0">
                        <ul class="list-inline list-inline-dots mb-0">
                            <li class="list-inline-item">&copy; {{ date('Y') }} Kanban</li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</div>
@filamentScripts
@livewireScripts
<script src="https://unpkg.com/@tabler/core@1.0.0-beta20/dist/js/tabler.min.js"></script>
<script>
    (function(){
        const toggle = document.getElementById('themeToggle');
        if (!toggle) return;
        const body = document.body;
        const iconLight = document.getElementById('icon-light');
        const iconDark = document.getElementById('icon-dark');
        const apply = (mode) => {
            if (mode === 'dark') { body.classList.add('theme-dark'); iconLight?.classList.remove('d-none'); iconDark?.classList.add('d-none'); }
            else { body.classList.remove('theme-dark'); iconLight?.classList.add('d-none'); iconDark?.classList.remove('d-none'); }
            try { localStorage.setItem('kanban.theme', mode); } catch {}
        };
        const saved = (()=>{ try { return localStorage.getItem('kanban.theme') } catch { return null } })();
        apply(saved === 'dark' ? 'dark' : 'light');
        toggle.addEventListener('click', (e)=>{ e.preventDefault(); const isDark = body.classList.contains('theme-dark'); apply(isDark ? 'light' : 'dark'); });
    })();
    // enable tooltips
    if (window.bootstrap && bootstrap.Tooltip) {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
    }
</script>
@stack('scripts')
</body>
</html>
