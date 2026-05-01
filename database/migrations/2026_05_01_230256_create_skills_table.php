<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('skills', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('icon');
            $table->string('file_name');
            $table->string('lang')->unique();
            $table->string('color');
            $table->enum('mode', ['code', 'terminal']);
            $table->json('code')->nullable();
            $table->json('commands')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skills');
    }
};
