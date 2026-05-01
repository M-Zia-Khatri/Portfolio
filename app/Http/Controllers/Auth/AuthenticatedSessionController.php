<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Mail\AdminOtpCodeMail;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(LoginRequest $request, OtpService $otpService): RedirectResponse
    {
        $request->ensureIsNotRateLimited();

        $credentials = $request->only('email', 'password');

        if (! Auth::validate($credentials)) {
            RateLimiter::hit($request->throttleKey());
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $user = User::query()->where('email', $credentials['email'])->firstOrFail();

        if ($user->role !== 'admin') {
            throw ValidationException::withMessages([
                'email' => __('Only admin users are allowed to access this system.'),
            ]);
        }

        RateLimiter::clear($request->throttleKey());

        $code = $otpService->generateOtp($user->id);
        Mail::to($user->email)->send(new AdminOtpCodeMail($code));

        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $request->session()->put('2fa:user:id', $user->id);
        $request->session()->put('2fa_verified', false);

        return redirect()->route('otp.create')->with('status', 'We sent a one-time code to your email.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
