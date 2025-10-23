<?php

declare(strict_types=1);

namespace Deljdlx\Kanban\Http\Controllers\Auth;

use App\Models\User; // Uses the host app's User model
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/**
 * Handles user registration for the Kanban package.
 */
final class RegisterController
{
    /** Show the registration form. */
    public function create(): View
    {
        return view('kanban::auth.register');
    }

    /** Create a new user account. */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->only(['name', 'email', 'password', 'password_confirmation']);
        $v = Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        $v->validate();

        /** @var User $user */
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        Auth::login($user);
        $to = (string) config('kanban.redirect_after_register', '/');
        return redirect()->intended($to);
    }
}
