<?php

use App\Mail\AdminOtpCodeMail;
use App\Models\OtpToken;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

it('rejects non-admin login attempts', function () {
    $user = User::factory()->create(['password' => 'password', 'role' => 'user']);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    expect(auth()->check())->toBeFalse();
});

it('requires otp before completing admin login', function () {
    Mail::fake();

    $user = User::factory()->admin()->create(['password' => 'password']);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('otp.create', absolute: false));

    expect(session('2fa:user:id'))->toBe($user->id);
    expect(auth()->check())->toBeFalse();
    expect(OtpToken::query()->where('user_id', $user->id)->count())->toBe(1);

    Mail::assertSent(AdminOtpCodeMail::class);
});
