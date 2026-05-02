<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

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
            $this->createContactMessagesTable();

            return;
        }

        $this->ensureRequiredColumnsExist();
        $this->migrateLegacyIntegerIdTableIfNeeded();
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

    private function createContactMessagesTable(): void
    {
        Schema::create('contact_messages', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('full_name');
            $table->string('email');
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    private function ensureRequiredColumnsExist(): void
    {
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

    private function migrateLegacyIntegerIdTableIfNeeded(): void
    {
        $idType = Schema::getColumnType('contact_messages', 'id');

        if ($idType === 'uuid' || $idType === 'string') {
            return;
        }

        Schema::create('contact_messages_migrated', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('full_name');
            $table->string('email');
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        DB::table('contact_messages')
            ->orderBy('id')
            ->chunk(200, function ($rows): void {
                $payload = [];

                foreach ($rows as $row) {
                    $payload[] = [
                        'id' => (string) Str::uuid(),
                        'full_name' => (string) ($row->full_name ?? 'Unknown'),
                        'email' => (string) ($row->email ?? 'unknown@example.com'),
                        'message' => (string) ($row->message ?? ''),
                        'is_read' => (bool) ($row->is_read ?? false),
                        'created_at' => $row->created_at,
                        'updated_at' => $row->updated_at,
                    ];
                }

                DB::table('contact_messages_migrated')->insert($payload);
            });

        Schema::drop('contact_messages');
        Schema::rename('contact_messages_migrated', 'contact_messages');
    }
};
