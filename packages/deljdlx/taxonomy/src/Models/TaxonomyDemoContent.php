<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Models;

use Deljdlx\Taxonomy\Concerns\HasTerms;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Demo content entity used for showcasing taxonomy tagging.
 * Table: taxonomy_demo_contents
 */
class TaxonomyDemoContent extends Model
{
    use HasFactory;
    use HasTerms;

    protected $table = 'taxonomy_demo_contents';

    protected $fillable = [
        'title',
        'body',
        'extra',
    ];

    protected $casts = [
        'extra' => 'array',
    ];
}
