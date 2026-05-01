<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('SEED_ADMIN_EMAIL');
        $password = env('SEED_ADMIN_PASSWORD');
        $name = env('SEED_ADMIN_NAME', 'Admin User');

        if (! $email || ! $password) {
            return;
        }

        Admin::query()->updateOrCreate(
            ['email' => $email],
            [
                'full_name' => $name,
                'password_hash' => Hash::make($password),
                'is_active' => true,
            ]
        );
    }
}
