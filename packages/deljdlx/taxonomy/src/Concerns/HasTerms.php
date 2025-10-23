<?php

declare(strict_types=1);

namespace Deljdlx\Taxonomy\Concerns;

use Deljdlx\Taxonomy\Models\Term;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait HasTerms
{
    public function terms(): MorphToMany
    {
        return $this->morphToMany(Term::class, 'termable', 'termables')
            ->withPivot(['position','is_primary','extra'])
            ->withTimestamps()
            ->orderBy('termables.position');
    }
}
