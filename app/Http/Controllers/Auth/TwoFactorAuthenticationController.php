<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorAuthenticationController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('2fa:user:id')) {
            return redirect()->route('login');
        }

        return Inertia::render('auth/verify-otp', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(Request $request, OtpService $otpService): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $userId = (int) $request->session()->get('2fa:user:id');

        if ($userId === 0) {
            return redirect()->route('login');
        }

        $throttleKey = 'otp-attempt:'.$userId.'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            throw ValidationException::withMessages([
                'code' => __('auth.throttle', ['seconds' => $seconds, 'minutes' => (int) ceil($seconds / 60)]),
            ]);
        }

        if (! $otpService->verifyOtp($userId, (string) $request->string('code'))) {
            RateLimiter::hit($throttleKey, 300);

            throw ValidationException::withMessages([
                'code' => __('The provided one-time code is invalid or expired.'),
            ]);
        }

        $user = User::query()->findOrFail($userId);

        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->put('2fa_verified', true);
        $request->session()->forget('2fa:user:id');
        RateLimiter::clear($throttleKey);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
