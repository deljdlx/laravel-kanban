<?php

declare(strict_types=1);

namespace Deljdlx\Kanban\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;

final class ShowcaseController
{
    public function __invoke(): View
    {
        $kpis = [
            ['icon' => 'ti ti-layout-kanban', 'label' => 'Boards', 'value' => 4, 'delta' => '+1', 'color' => 'primary'],
            ['icon' => 'ti ti-list-check', 'label' => 'Tickets', 'value' => 128, 'delta' => '+12', 'color' => 'green'],
            ['icon' => 'ti ti-player-play', 'label' => 'En cours', 'value' => 34, 'delta' => '+3', 'color' => 'orange'],
            ['icon' => 'ti ti-circle-check', 'label' => 'Terminés', 'value' => 87, 'delta' => '+8', 'color' => 'teal'],
        ];

        $activities = [
            ['user' => 'Alice', 'avatar' => 'A', 'action' => 'a créé', 'target' => 'Ticket #321', 'time' => 'il y a 10 min', 'badge' => ['text' => 'nouveau', 'color' => 'blue']],
            ['user' => 'Bob', 'avatar' => 'B', 'action' => 'a déplacé', 'target' => 'Ticket #318 → Review', 'time' => 'il y a 1 h', 'badge' => ['text' => 'workflow', 'color' => 'orange']],
            ['user' => 'Chloé', 'avatar' => 'C', 'action' => 'a commenté', 'target' => 'Ticket #290', 'time' => 'il y a 3 h', 'badge' => ['text' => 'discussion', 'color' => 'purple']],
        ];

        $projects = [
            ['title' => 'Refacto auth', 'owner' => 'Alice', 'status' => ['text' => 'En cours', 'color' => 'warning'], 'progress' => 55, 'updated' => 'il y a 2 j'],
            ['title' => 'Docs API', 'owner' => 'Bob', 'status' => ['text' => 'Revue', 'color' => 'info'], 'progress' => 80, 'updated' => 'hier'],
            ['title' => 'Onboarding', 'owner' => 'Chloé', 'status' => ['text' => 'Terminé', 'color' => 'success'], 'progress' => 100, 'updated' => 'il y a 1 h'],
        ];

        $team = [
            ['name' => 'Alice', 'initial' => 'A'],
            ['name' => 'Bob', 'initial' => 'B'],
            ['name' => 'Chloé', 'initial' => 'C'],
            ['name' => 'David', 'initial' => 'D'],
        ];

        $miniKanban = [
            ['name' => 'À faire', 'count' => 4, 'tickets' => [ ['title' => 'Set up CI', 'label' => 'chore'], ['title' => 'Bug formulaire', 'label' => 'bug'] ]],
            ['name' => 'En cours', 'count' => 3, 'tickets' => [ ['title' => 'Refacto auth', 'label' => 'feature'] ]],
            ['name' => 'Revue', 'count' => 2, 'tickets' => [ ['title' => 'Docs API', 'label' => 'docs'] ]],
            ['name' => 'Terminé', 'count' => 87, 'tickets' => [ ['title' => 'Audit sécurité', 'label' => 'chore'] ]],
        ];

        return view('kanban::showcase', [
            'user' => Auth::user(),
            'kpis' => $kpis,
            'activities' => $activities,
            'projects' => $projects,
            'team' => $team,
            'miniKanban' => $miniKanban,
        ]);
    }
}
