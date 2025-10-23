<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Support;

/**
 * Static catalog of illustrative presets for provisioning taxonomies and terms.
 */
final class Presets
{
    /**
     * Return preset definition arrays.
     *
     * @return array<string, array>
     */
    public static function all(): array
    {
        return [
            'global' => self::globalPreset(),
            'kanban' => self::kanbanPreset(),
            'blog' => self::blogPreset(),
            'ecommerce' => self::ecommercePreset(),
        ];
    }

    /**
     * @return array{taxonomies: array<int, array<string, mixed>>}
     */
    private static function globalPreset(): array
    {
        return [
            'taxonomies' => [
                [
                    'slug' => 'criticality',
                    'name' => 'Criticité',
                    'hierarchical' => false,
                    'terms' => [
                        ['slug' => 'blocker', 'name' => 'Blocker', 'extra' => ['rank' => 100, 'color' => 'red', 'icon' => 'ti-alert-triangle']],
                        ['slug' => 'critical', 'name' => 'Critical', 'extra' => ['rank' => 80, 'color' => 'orange', 'icon' => 'ti-flame']],
                        ['slug' => 'major', 'name' => 'Major', 'extra' => ['rank' => 60, 'color' => 'yellow', 'icon' => 'ti-alert-circle']],
                        ['slug' => 'minor', 'name' => 'Minor', 'extra' => ['rank' => 40, 'color' => 'green', 'icon' => 'ti-circle-check']],
                        ['slug' => 'trivial', 'name' => 'Trivial', 'extra' => ['rank' => 20, 'color' => 'blue', 'icon' => 'ti-info-circle']],
                    ],
                ],
                [
                    'slug' => 'priority',
                    'name' => 'Priority',
                    'hierarchical' => false,
                    'terms' => [
                        ['slug' => 'p0', 'name' => 'P0'],
                        ['slug' => 'p1', 'name' => 'P1'],
                        ['slug' => 'p2', 'name' => 'P2'],
                        ['slug' => 'p3', 'name' => 'P3'],
                    ],
                ],
                [
                    'slug' => 'risk',
                    'name' => 'Risk',
                    'hierarchical' => false,
                    'terms' => [
                        ['slug' => 'high', 'name' => 'High'],
                        ['slug' => 'medium', 'name' => 'Medium'],
                        ['slug' => 'low', 'name' => 'Low'],
                    ],
                ],
                [
                    'slug' => 'effort',
                    'name' => 'Effort',
                    'hierarchical' => false,
                    'terms' => [
                        ['slug' => 'xs', 'name' => 'XS'],
                        ['slug' => 's', 'name' => 'S'],
                        ['slug' => 'm', 'name' => 'M'],
                        ['slug' => 'l', 'name' => 'L'],
                        ['slug' => 'xl', 'name' => 'XL'],
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array{taxonomies: array<int, array<string, mixed>>}
     */
    private static function kanbanPreset(): array
    {
        return [
            'taxonomies' => [
                [
                    'slug' => 'status',
                    'name' => 'Status',
                    'hierarchical' => false,
                    'terms' => [
                        ['slug' => 'backlog', 'name' => 'Backlog'],
                        ['slug' => 'todo', 'name' => 'To do'],
                        ['slug' => 'in-progress', 'name' => 'In progress'],
                        ['slug' => 'review', 'name' => 'Review'],
                        ['slug' => 'done', 'name' => 'Done'],
                    ],
                ],
                [
                    'slug' => 'labels',
                    'name' => 'Labels',
                    'hierarchical' => false,
                    'terms' => [
                        ['slug' => 'bug', 'name' => 'Bug'],
                        ['slug' => 'feature', 'name' => 'Feature'],
                        ['slug' => 'enhancement', 'name' => 'Enhancement'],
                        ['slug' => 'documentation', 'name' => 'Documentation'],
                        ['slug' => 'design', 'name' => 'Design'],
                        ['slug' => 'backend', 'name' => 'Backend'],
                        ['slug' => 'frontend', 'name' => 'Frontend'],
                        ['slug' => 'devops', 'name' => 'DevOps'],
                    ],
                ],
                [
                    'slug' => 'components',
                    'name' => 'Components',
                    'hierarchical' => true,
                    'tree' => [
                        'app' => [
                            'frontend' => [],
                            'backend' => [],
                        ],
                        'infra' => [
                            'ci' => [],
                            'cd' => [],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array{taxonomies: array<int, array<string, mixed>>}
     */
    private static function blogPreset(): array
    {
        return [
            'taxonomies' => [
                [
                    'slug' => 'category',
                    'name' => 'Category',
                    'hierarchical' => true,
                    'tree' => [
                        'tech' => [
                            'php' => [],
                            'js' => [],
                        ],
                        'life' => [],
                        'news' => [],
                    ],
                ],
                [
                    'slug' => 'tags',
                    'name' => 'Tags',
                    'hierarchical' => false,
                    'terms' => [
                        ['slug' => 'laravel', 'name' => 'Laravel'],
                        ['slug' => 'livewire', 'name' => 'Livewire'],
                        ['slug' => 'filament', 'name' => 'Filament'],
                        ['slug' => 'docker', 'name' => 'Docker'],
                        ['slug' => 'devops', 'name' => 'DevOps'],
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array{taxonomies: array<int, array<string, mixed>>}
     */
    private static function ecommercePreset(): array
    {
        return [
            'taxonomies' => [
                [
                    'slug' => 'category',
                    'name' => 'Category',
                    'hierarchical' => true,
                    'tree' => [
                        'electronics' => [
                            'phones' => [],
                            'laptops' => [],
                        ],
                        'fashion' => [
                            'men' => [],
                            'women' => [],
                        ],
                    ],
                ],
                [
                    'slug' => 'tags',
                    'name' => 'Tags',
                    'hierarchical' => false,
                    'terms' => [
                        ['slug' => 'sale', 'name' => 'Sale'],
                        ['slug' => 'new', 'name' => 'New'],
                        ['slug' => 'bestseller', 'name' => 'Bestseller'],
                        ['slug' => 'eco', 'name' => 'Eco'],
                        ['slug' => 'premium', 'name' => 'Premium'],
                    ],
                ],
            ],
        ];
    }
}
