<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Card extends Component
{

    private string $heading = '';

    /**
     * Create a new component instance.
     */
    public function __construct(string $heading = '')
    {
        $this->heading = $heading;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.card', [
            'heading' => $this->heading,
        ]);
    }
}
