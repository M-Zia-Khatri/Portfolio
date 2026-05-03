<?php

use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

function actingPortfolioAdmin(): Admin
{
    $admin = Admin::query()->create([
        'email' => 'portfolio-admin@example.com',
        'password_hash' => Hash::make('password123'),
        'full_name' => 'Portfolio Admin',
        'is_active' => true,
    ]);

    test()->actingAs($admin, 'web');

    return $admin;
}

it('renders portfolio index page', function () {
    actingPortfolioAdmin();

    $this->get(route('portfolio.index'))->assertOk();
});

it('validates required portfolio payload fields', function () {
    actingPortfolioAdmin();

    $this->post(route('portfolio.store'), [
        'site_name' => '',
        'site_role' => '',
        'site_url' => 'not-a-url',
        'use_tech' => [],
        'description' => '',
    ])->assertSessionHasErrors(['site_name', 'site_role', 'site_url', 'site_image', 'use_tech', 'description']);
});

it('validates use_tech item entries', function () {
    actingPortfolioAdmin();

    $this->post(route('portfolio.store'), [
        'site_name' => 'Portfolio Name',
        'site_role' => 'Backend',
        'site_url' => 'https://example.com',
        'site_image' => UploadedFile::fake()->create('site.jpg', 100, 'image/jpeg'),
        'use_tech' => ['Laravel', ''],
        'description' => 'Portfolio description',
    ])->assertSessionHasErrors(['use_tech.1']);
});
