<?php

declare(strict_types=1);

return [
    'route_prefix' => env('TAXONOMY_API_PREFIX', 'app/api'),
    'cache' => [
        'enabled' => true,
        'ttl' => 300,
    ],
];
