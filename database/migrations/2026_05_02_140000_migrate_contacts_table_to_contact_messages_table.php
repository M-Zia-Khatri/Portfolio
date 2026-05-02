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
        if (Schema::hasTable('contacts') && ! Schema::hasTable('contact_messages')) {
            Schema::rename('contacts', 'contact_messages');
        }

        if (! Schema::hasTable('contact_messages')) {
            Schema::create('contact_messages', function (Blueprint $table): void {
                $table->uuid('id')->primary();
                $table->string('full_name');
                $table->string('email');
                $table->text('message');
                $table->boolean('is_read')->default(false);
                $table->timestamps();
            });

            return;
        }

        Schema::table('contact_messages', function (Blueprint $table): void {
            if (! Schema::hasColumn('contact_messages', 'full_name')) {
                $table->string('full_name')->nullable()->after('id');
            }

            if (! Schema::hasColumn('contact_messages', 'email')) {
                $table->string('email')->nullable()->after('full_name');
            }

            if (! Schema::hasColumn('contact_messages', 'message')) {
                $table->text('message')->nullable()->after('email');
            }

            if (! Schema::hasColumn('contact_messages', 'is_read')) {
                $table->boolean('is_read')->default(false)->after('message');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('contact_messages') && ! Schema::hasTable('contacts')) {
            Schema::rename('contact_messages', 'contacts');
        }
    }
};
