<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\OtpToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthController extends Controller
{
    public function createLogin(): RedirectResponse|Response
    {
        if (Auth::guard('web')->check()) {
            return to_route('(admin)/dashboard');
        }

        return Inertia::render('(auth)/Login');
    }

    public function login(Request $request): RedirectResponse
    {
        $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        $admin = Admin::query()->where('email', $request->string('email'))->first();

        $passwordHash = $admin?->password_hash ?? '$2y$12$2w5A2m7udw8J5oM0QfYj9OwYUBz5K4D4w4d6ED8jx6WXf9R6H9bRC';
        if (! $admin || ! Hash::check($request->string('password')->toString(), $passwordHash) || ! $admin->is_active) {
            throw ValidationException::withMessages(['email' => 'The provided credentials are invalid.']);
        }

        OtpToken::query()->where('admin_id', $admin->id)->whereNull('used_at')->update(['used_at' => now()]);
        $otp = (string) random_int(100000, 999999);

        OtpToken::query()->create([
            'admin_id' => $admin->id,
            'code_hash' => Hash::make($otp),
            'expires_at' => now()->addMinutes(5),
        ]);

        Mail::raw("Your one-time passcode is: {$otp}. It expires in 5 minutes.", function ($message) use ($admin): void {
            $message->to($admin->email)->subject('Your admin login OTP');
        });

        $request->session()->put('auth.admin.pending_admin_id', $admin->id);

        return to_route('auth.otp.create')->with('status', 'Verification code sent to your email.');
    }

    public function createOtp(Request $request): RedirectResponse|Response
    {
        $pendingAdminId = $request->session()->get('auth.admin.pending_admin_id');

        if (! $pendingAdminId) {
            return to_route('auth.login.create');
        }

        $hasValidOtp = OtpToken::query()->where('admin_id', $pendingAdminId)->whereNull('used_at')->where('expires_at', '>', now())->exists();

        if (! $hasValidOtp) {
            $request->session()->forget('auth.admin.pending_admin_id');

            return to_route('auth.login.create');
        }

        return Inertia::render('(auth)/OtpVerify');
    }

    public function resendOtp(Request $request): RedirectResponse
    {
        $pendingAdminId = $request->session()->get('auth.admin.pending_admin_id');

        if (! $pendingAdminId) {
            return to_route('auth.login.create');
        }

        $admin = Admin::query()->find($pendingAdminId);

        if (! $admin || ! $admin->is_active) {
            $request->session()->forget('auth.admin.pending_admin_id');

            return to_route('auth.login.create');
        }

        OtpToken::query()->where('admin_id', $admin->id)->whereNull('used_at')->update(['used_at' => now()]);
        $otp = (string) random_int(100000, 999999);

        OtpToken::query()->create([
            'admin_id' => $admin->id,
            'code_hash' => Hash::make($otp),
            'expires_at' => now()->addMinutes(5),
        ]);

        Mail::raw("Your one-time passcode is: {$otp}. It expires in 5 minutes.", function ($message) use ($admin): void {
            $message->to($admin->email)->subject('Your admin login OTP');
        });

        return to_route('auth.otp.create')->with('status', 'Verification code resent to your email.');
    }

    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate(['otp' => ['required', 'digits:6']]);

        $pendingAdminId = $request->session()->get('auth.admin.pending_admin_id');
        $otpToken = OtpToken::query()->where('admin_id', $pendingAdminId)->whereNull('used_at')->where('expires_at', '>', now())->latest('id')->first();

        if (! $otpToken || ! Hash::check($request->string('otp')->toString(), $otpToken->code_hash)) {
            RateLimiter::hit('admin-otp:'.$request->ip(), 60);
            throw ValidationException::withMessages(['otp' => 'The one-time passcode is invalid or expired.']);
        }

        $otpToken->forceFill(['used_at' => now()])->save();
        Auth::guard('web')->login($otpToken->admin);
        $request->session()->forget('auth.admin.pending_admin_id');
        $request->session()->regenerate();

        return to_route('(admin)/dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('auth.login.create');
    }
}
