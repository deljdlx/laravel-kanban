<?php

declare(strict_types=1);

namespace Deljdlx\Kanban\Http\Controllers;

use Deljdlx\Taxonomy\Models\Taxonomy;
use Symfony\Component\HttpKernel\Exception\GoneHttpException;

/**
 * @deprecated This legacy controller was used for the removed ID-based route.
 *             Use TaxonomyShowBySlugController and the canonical route:
 *             GET /kanban/scopes/{scope}/taxonomies/{slug}
 */
final class TaxonomyShowController
{
    /**
     * Legacy entry point no longer supported.
     *
     * @throws GoneHttpException Always, since the route has been removed.
     */
    public function __invoke(Taxonomy $taxonomy): never
    {
        throw new GoneHttpException('This endpoint has been removed. Use the canonical scope+slug route.');
    }
}
