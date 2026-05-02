<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_items', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('site_name')->index();
            $table->string('site_role');
            $table->string('site_url');
            $table->string('site_image_url');
            $table->json('use_tech');
            $table->text('description');
            $table->timestamps();

            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_items');
    }
};
