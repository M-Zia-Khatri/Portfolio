<?php

use App\Models\Admin;
use App\Models\OtpToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

it('requires login for dashboard', function () {
    $this->get('/admin/dashboard')->assertRedirect('/auth/login');
});

it('redirects authenticated admin from auth login to admin dashboard', function () {
    $admin = Admin::query()->create([
        'email' => 'admin@example.com',
        'password_hash' => Hash::make('secret123!'),
        'full_name' => 'Admin User',
        'is_active' => true,
    ]);

    $this->actingAs($admin)->get('/auth/login')->assertRedirect('/admin/dashboard');
});

it('redirects otp verify page to login when pending otp is missing', function () {
    $this->get('/auth/otp-verify')->assertRedirect('/auth/login');
});

it('redirects otp verify page to login when otp is expired', function () {
    $admin = Admin::query()->create([
        'email' => 'admin@example.com',
        'password_hash' => Hash::make('secret123!'),
        'full_name' => 'Admin User',
        'is_active' => true,
    ]);

    OtpToken::query()->create([
        'admin_id' => $admin->id,
        'code_hash' => Hash::make('123456'),
        'expires_at' => now()->subMinute(),
    ]);

    $this->withSession(['auth.admin.pending_admin_id' => $admin->id])
        ->get('/auth/otp-verify')
        ->assertRedirect('/auth/login');
});

it('completes admin two-step login', function () {
    Mail::fake();

    $admin = Admin::query()->create([
        'email' => 'admin@example.com',
        'password_hash' => Hash::make('secret123!'),
        'full_name' => 'Admin User',
        'is_active' => true,
    ]);

    $this->post('/auth/login', [
        'email' => 'admin@example.com',
        'password' => 'secret123!',
    ])->assertRedirect('/auth/otp-verify');

    $token = OtpToken::query()->where('admin_id', $admin->id)->latest('id')->first();

    $this->assertNotNull($token);
    $this->assertNull($token->used_at);

    $this->post('/auth/otp-verify', ['otp' => '000000'])->assertSessionHasErrors('otp');
});
