<?php

declare(strict_types=1);

namespace Deljdlx\Kanban\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;

final class MeController
{
    public function __invoke(): View
    {
        return view('kanban::me', [
            'user' => Auth::user(),
        ]);
    }
}
