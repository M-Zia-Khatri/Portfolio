<?php

use App\Models\Admin;
use App\Models\Skill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

function actingAdmin(): Admin
{
    $admin = Admin::query()->create([
        'email' => 'skills-admin@example.com',
        'password_hash' => Hash::make('password123'),
        'full_name' => 'Skills Admin',
        'is_active' => true,
    ]);

    test()->actingAs($admin, 'web');

    return $admin;
}

it('renders the skills index page', function () {
    actingAdmin();

    $this->get(route('skills.index'))->assertOk();
});

it('stores a code skill with conditional validation', function () {
    actingAdmin();

    $this->post(route('skills.store'), [
        'name' => 'Laravel',
        'icon' => 'laravel',
        'file_name' => 'laravel.php',
        'lang' => 'php',
        'color' => '#ff2d20',
        'mode' => 'code',
        'commands' => [['kind' => 'command', 'text' => 'php artisan test']],
    ])->assertSessionHasErrors(['code', 'commands']);

    $this->post(route('skills.store'), [
        'name' => 'Laravel',
        'icon' => 'laravel',
        'file_name' => 'laravel.php',
        'lang' => 'php',
        'color' => '#ff2d20',
        'mode' => 'code',
        'code' => ['Route::get(...);', ''],
    ])->assertRedirect(route('skills.index'));

    expect(Skill::query()->where('lang', 'php')->exists())->toBeTrue();
});
