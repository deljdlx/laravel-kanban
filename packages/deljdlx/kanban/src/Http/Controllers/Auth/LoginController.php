<?php

declare(strict_types=1);

namespace Deljdlx\Kanban\Http\Controllers\Auth;

use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * Handles user login for the Kanban package.
 */
final class LoginController
{
    /**
     * Show the login form.
     */
    public function create(): View
    {
        return view('kanban::auth.login');
    }

    /**
     * Handle an authentication attempt.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->only(['email', 'password', 'remember']);
        $v = Validator::make($data, [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);
        $v->validate();

        $remember = (bool) ($data['remember'] ?? false);
        if (Auth::attempt(['email' => $data['email'], 'password' => $data['password']], $remember)) {
            $request->session()->regenerate();
            $to = (string) config('kanban.redirect_after_login', '/');
            return redirect()->intended($to);
        }

        return back()
            ->withErrors(['email' => __('auth.failed')])
            ->withInput($request->only('email'));
    }
}
