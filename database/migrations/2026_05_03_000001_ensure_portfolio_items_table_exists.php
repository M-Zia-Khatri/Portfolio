<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('portfolio_items')) {
            return;
        }

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

        if (! Schema::hasTable('portfolios')) {
            return;
        }

        $legacyColumns = [
            'site_name',
            'site_role',
            'site_url',
            'site_image_url',
            'use_tech',
            'description',
            'created_at',
            'updated_at',
        ];

        $availableColumns = array_values(array_filter(
            $legacyColumns,
            static fn (string $column): bool => Schema::hasColumn('portfolios', $column)
        ));

        if ($availableColumns === []) {
            return;
        }

        DB::table('portfolios')->select($availableColumns)->orderBy('created_at')->chunk(100, function ($rows): void {
            foreach ($rows as $row) {
                $payload = (array) $row;
                $payload['id'] = (string) Str::uuid();
                $payload['use_tech'] = $payload['use_tech'] ?? json_encode([]);

                DB::table('portfolio_items')->insert($payload);
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_items');
    }
};
