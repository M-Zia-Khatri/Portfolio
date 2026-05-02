<?php

use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\SkillController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/login', fn () => redirect()->route('auth.login.create'))->name('login');

Route::middleware('guest')->group(function (): void {
    Route::get('/auth/login', [AdminAuthController::class, 'createLogin'])->name('auth.login.create');
    Route::post('/auth/login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1')->name('auth.login');

    Route::get('/auth/verify-otp', [AdminAuthController::class, 'createOtp'])->name('auth.otp.create');
    Route::post('/auth/verify-otp', [AdminAuthController::class, 'verifyOtp'])->middleware('throttle:5,1')->name('auth.otp.verify');
});

Route::middleware(['auth', 'require-admin'])->group(function (): void {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::post('/auth/logout', [AdminAuthController::class, 'logout'])->name('auth.logout');

    Route::resource('skills', SkillController::class)->except('show');
});
