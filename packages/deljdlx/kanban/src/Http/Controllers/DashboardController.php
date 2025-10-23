<?php

declare(strict_types=1);

namespace Deljdlx\Kanban\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;

/**
 * Kanban Dashboard landing page controller.
 */
final class DashboardController
{
    public function __invoke(): View
    {
        // Example demo stats placeholders; replace by your app’s data if needed
        $stats = [
            ['label' => 'Tickets', 'value' => 128, 'delta' => '+12%'],
            ['label' => 'En cours', 'value' => 34, 'delta' => '+3%'],
            ['label' => 'Revue', 'value' => 7, 'delta' => '0%'],
            ['label' => 'Terminé', 'value' => 87, 'delta' => '+8%'],
        ];

        return view('kanban::dashboard', [
            'user' => Auth::user(),
            'stats' => $stats,
            'today' => now(),
        ]);
    }
}
