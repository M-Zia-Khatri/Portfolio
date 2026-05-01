<?php

use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('guests are redirected to the admin login page', function () {
    $this->get('/dashboard')->assertRedirect('/auth/login');
});

test('authenticated admins can visit the dashboard', function () {
    $admin = Admin::query()->create([
        'email' => 'active-admin@example.com',
        'password_hash' => Hash::make('password123'),
        'full_name' => 'Active Admin',
        'is_active' => true,
    ]);

    $this->actingAs($admin, 'web');

    $this->get('/dashboard')->assertOk();
});
