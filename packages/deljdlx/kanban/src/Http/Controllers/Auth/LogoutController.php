<?php

declare(strict_types=1);

namespace Deljdlx\Kanban\Http\Controllers\Auth;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Handles logout.
 */
final class LogoutController
{
    public function __invoke(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $redirect = (string) (config('kanban.redirect_after_logout') ?? ('/' . trim((string) config('kanban.route_prefix', 'kanban'), '/') . '/login'));
        return redirect($redirect);
    }
}
