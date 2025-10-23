<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

/**
 * @property int $id
 * @property int $taxonomy_id
 * @property string $name
 * @property string $slug
 * @property string $path
 * @property int $depth
 * @property int $usage_count
 * @property array|null $extra
 */
class Term extends Model
{
    use HasFactory;

    protected $fillable = [
        'taxonomy_id', 'name', 'slug', 'description', 'parent_id', 'path', 'depth', 'usage_count', 'extra',
    ];

    protected $casts = [
        'depth' => 'integer',
        'usage_count' => 'integer',
        'extra' => 'array',
    ];

    public function taxonomy(): BelongsTo
    {
        return $this->belongsTo(Taxonomy::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    // Relations to termables are accessed from the termable model via the HasTerms trait.
}
