<?php

declare(strict_types=1);

namespace Deljdlx\Kanban\Http\Controllers;

use Illuminate\Http\Response;

/**
 * Simple health-check endpoint controller for the Kanban package.
 */
final class KanbanPingController
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): Response
    {
        return response('ok', 200);
    }
}
