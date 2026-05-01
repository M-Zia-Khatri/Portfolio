<?php

use App\Models\Admin;
use App\Models\OtpToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

it('requires login for dashboard', function () {
    $this->get('/dashboard')->assertRedirect('/auth/login');
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
    ])->assertRedirect('/auth/verify-otp');

    $token = OtpToken::query()->where('admin_id', $admin->id)->latest('id')->first();

    $this->assertNotNull($token);
    $this->assertNull($token->used_at);

    $this->post('/auth/verify-otp', ['otp' => '000000'])->assertSessionHasErrors('otp');
});
