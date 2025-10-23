<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $scope
 * @property bool $hierarchical
 * @property string|null $color
 * @property string|null $icon
 * @property bool $is_system
 * @property string|null $description
 */
class Taxonomy extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'scope', 'hierarchical', 'color', 'icon', 'is_system', 'description',
    ];

    protected $casts = [
        'hierarchical' => 'boolean',
        'is_system' => 'boolean',
    ];

    public function terms(): HasMany
    {
        return $this->hasMany(Term::class)->orderBy('path');
    }
}
