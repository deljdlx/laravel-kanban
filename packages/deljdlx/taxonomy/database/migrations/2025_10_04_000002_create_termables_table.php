<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('termables')) {
            return; // already created (idempotency for partial runs)
        }
        Schema::create('termables', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('term_id')->constrained('terms')->cascadeOnDelete();
            $table->morphs('termable');
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->json('extra')->nullable();
            $table->timestamps();

            $table->unique(['term_id', 'termable_type', 'termable_id'], 'termables_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('termables');
    }
};
