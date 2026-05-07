<?php

use App\Data\PortfolioItemData;
use App\Data\SkillData;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\SkillController;
use App\Models\PortfolioItem;
use App\Models\Skill;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // 1. Optimize skill retrieval: Sort by mode in DB (code=0, other=1) then by date
    $skills = Skill::query()
        ->orderByRaw("CASE WHEN mode = 'code' THEN 0 ELSE 1 END")
        ->oldest('created_at')
        ->get();

    // 2. Efficiently split skills for contact section
    $contactSkills = SkillData::collection($skills->where('mode', 'code'));

    // 3. Keep original sorted skills
    $skillData = SkillData::collection($skills);

    $portfolioItems = PortfolioItemData::collection(
        PortfolioItem::query()->latest('created_at')->get()
    );

    return Inertia::render('home/index', [
        'skills' => $skillData,
        'contactSkills' => $contactSkills,
        'portfolioItems' => $portfolioItems,
    ]);
})->name('home');

Route::get('/login', fn () => redirect()->route('auth.login.create'))->name('login');

Route::post('/contact', [ContactController::class, 'submit'])->name('contact.submit');

Route::middleware('guest')->group(function (): void {
    Route::get('/auth/login', [AdminAuthController::class, 'createLogin'])->name('auth.login.create');
    Route::post('/auth/login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1')->name('auth.login');

    Route::get('/auth/otp-verify', [AdminAuthController::class, 'createOtp'])->name('auth.otp.create');
    Route::post('/auth/otp-verify', [AdminAuthController::class, 'verifyOtp'])->middleware('throttle:5,1')->name('auth.otp.verify');
    Route::post('/auth/otp-resend', [AdminAuthController::class, 'resendOtp'])->name('auth.login.resend');
});

Route::middleware(['auth', 'require-admin'])->prefix('admin')->group(function (): void {
    Route::get('/dashboard', function () {
        return Inertia::render('(admin)/dashboard');
    })->name('admin.dashboard');

    Route::post('/auth/logout', [AdminAuthController::class, 'logout'])->name('auth.logout');

    Route::resource('/skills', SkillController::class)->except('show');
    Route::resource('/portfolio', PortfolioController::class)->except('show');

    Route::get('/contact', [ContactController::class, 'index'])->name('admin.contact.index');
    Route::delete('/contact/{id}', [ContactController::class, 'destroy'])->name('admin.contact.destroy');
});
