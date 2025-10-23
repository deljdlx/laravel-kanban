<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('taxonomies', function (Blueprint $table): void {
            // Drop global unique on slug if it exists
            try {
                $table->dropUnique('taxonomies_slug_unique');
            } catch (Throwable $e) {
                // ignore if index does not exist
            }
            // Add composite unique on (scope, slug)
            $table->unique(['scope', 'slug'], 'taxonomies_scope_slug_unique');
        });
    }

    public function down(): void
    {
        Schema::table('taxonomies', function (Blueprint $table): void {
            // Drop composite and re-add global unique on slug
            try {
                $table->dropUnique('taxonomies_scope_slug_unique');
            } catch (Throwable $e) {
                // ignore
            }
            $table->unique('slug');
        });
    }
};
