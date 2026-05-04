<?php

use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\SkillController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::get('/login', fn () => redirect()->route('auth.login.create'))->name('login');

Route::post('/contact', [ContactController::class, 'submit'])->name('contact.submit');

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
    Route::resource('portfolio', PortfolioController::class)->except('show');

    Route::get('/admin/contact', [ContactController::class, 'index'])->name('admin.contact.index');
    Route::delete('/admin/contact/{id}', [ContactController::class, 'destroy'])->name('admin.contact.destroy');
});
