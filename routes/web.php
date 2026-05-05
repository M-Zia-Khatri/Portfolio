<?php

use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\SkillController;
use App\Models\PortfolioItem;
use App\Models\Skill;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $skills = Skill::query()->latest('created_at')->get()->map(fn (Skill $skill): array => [
        'id' => $skill->id,
        'name' => $skill->name,
        'icon' => $skill->icon,
        'fileName' => $skill->file_name,
        'lang' => $skill->lang,
        'color' => $skill->color,
        'mode' => $skill->mode,
        'code' => $skill->code,
        'commands' => $skill->commands,
    ]);

    $portfolioItems = PortfolioItem::query()->latest('created_at')->get()->map(fn (PortfolioItem $portfolioItem): array => [
        'id' => $portfolioItem->id,
        'siteName' => $portfolioItem->site_name,
        'siteRole' => $portfolioItem->site_role,
        'siteUrl' => $portfolioItem->site_url,
        'siteImageUrl' => $portfolioItem->site_image_url,
        'useTech' => $portfolioItem->use_tech,
        'description' => $portfolioItem->description,
    ]);

    return Inertia::render('home/index', ['skills' => $skills, 'portfolioItems' => $portfolioItems]);
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

Route::middleware(['auth', 'require-admin'])->group(function (): void {
    Route::get('/admin/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::post('/auth/logout', [AdminAuthController::class, 'logout'])->name('auth.logout');

    Route::resource('skills', SkillController::class)->except('show');
    Route::resource('portfolio', PortfolioController::class)->except('show');

    Route::get('/admin/contact', [ContactController::class, 'index'])->name('admin.contact.index');
    Route::delete('/admin/contact/{id}', [ContactController::class, 'destroy'])->name('admin.contact.destroy');
});
