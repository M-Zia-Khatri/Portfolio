<?php

use App\Models\Admin;
use App\Models\PortfolioItem;
use App\Services\CloudinaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

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

function createPortfolioItem(array $attributes = []): PortfolioItem
{
    return PortfolioItem::query()->create([
        'site_name' => $attributes['site_name'] ?? 'Portfolio Name',
        'site_role' => $attributes['site_role'] ?? 'Full Stack Developer',
        'site_url' => $attributes['site_url'] ?? 'https://example.com',
        'site_image_url' => $attributes['site_image_url'] ?? 'https://res.cloudinary.com/demo/image/upload/v1/portfolio/site.jpg',
        'use_tech' => $attributes['use_tech'] ?? ['Laravel', 'React'],
        'description' => $attributes['description'] ?? 'Portfolio description',
    ]);
}

it('renders portfolio index page with server-driven portfolio props', function () {
    actingPortfolioAdmin();

    createPortfolioItem(['site_name' => 'Inertia Portfolio']);

    $this->get(route('portfolio.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('(admin)/portfolio/index')
            ->has('portfolioItems', 1)
            ->where('portfolioItems.0.siteName', 'Inertia Portfolio')
            ->where('portfolioItems.0.siteRole', 'Full Stack Developer')
            ->where('portfolioItems.0.useTech.0', 'Laravel')
        );
});

it('validates required portfolio payload fields', function () {
    actingPortfolioAdmin();

    $this->post(route('portfolio.store'), [
        'siteName' => '',
        'siteRole' => '',
        'siteUrl' => 'not-a-url',
        'useTech' => [],
        'description' => '',
    ])->assertSessionHasErrors(['siteName', 'siteRole', 'siteUrl', 'siteImage', 'useTech', 'description']);
});

it('validates useTech item entries', function () {
    actingPortfolioAdmin();

    $this->post(route('portfolio.store'), [
        'siteName' => 'Portfolio Name',
        'siteRole' => 'Backend',
        'siteUrl' => 'https://example.com',
        'siteImage' => UploadedFile::fake()->create('site.jpg', 100, 'image/jpeg'),
        'useTech' => ['Laravel', ''],
        'description' => 'Portfolio description',
    ])->assertSessionHasErrors(['useTech.1']);
});

it('stores portfolio items with form request validation and redirects to the index', function (): void {
    actingPortfolioAdmin();

    $cloudinaryService = $this->mock(CloudinaryService::class);
    $cloudinaryService->shouldReceive('uploadToCloudinary')
        ->once()
        ->andReturn('https://res.cloudinary.com/demo/image/upload/v1/portfolio/new-site.jpg');
    $cloudinaryService->shouldReceive('deleteFromCloudinary')->never();

    $this->post(route('portfolio.store'), [
        'siteName' => 'New Portfolio',
        'siteRole' => 'Frontend Developer',
        'siteUrl' => 'https://new.example.com',
        'siteImage' => UploadedFile::fake()->image('site.jpg'),
        'useTech' => ['React', 'Tailwind'],
        'description' => 'New portfolio description',
    ])->assertRedirect(route('portfolio.index'))
        ->assertSessionHas('success', 'Portfolio item created successfully.');

    $portfolioItem = PortfolioItem::query()->first();

    expect($portfolioItem)->not->toBeNull();
    expect($portfolioItem->site_name)->toBe('New Portfolio');
    expect($portfolioItem->use_tech)->toBe(['React', 'Tailwind']);
});

it('updates portfolio items without requiring a replacement image', function (): void {
    actingPortfolioAdmin();

    $portfolioItem = createPortfolioItem();

    $cloudinaryService = $this->mock(CloudinaryService::class);
    $cloudinaryService->shouldReceive('uploadToCloudinary')->never();
    $cloudinaryService->shouldReceive('deleteFromCloudinary')->never();

    $this->patch(route('portfolio.update', $portfolioItem), [
        'siteName' => 'Updated Portfolio',
        'siteRole' => 'Backend Developer',
        'siteUrl' => 'https://updated.example.com',
        'useTech' => ['Laravel', 'PostgreSQL'],
        'description' => 'Updated description',
    ])->assertRedirect(route('portfolio.index'))
        ->assertSessionHas('success', 'Portfolio item updated successfully.');

    $portfolioItem->refresh();

    expect($portfolioItem->site_name)->toBe('Updated Portfolio');
    expect($portfolioItem->site_image_url)->toBe('https://res.cloudinary.com/demo/image/upload/v1/portfolio/site.jpg');
    expect($portfolioItem->use_tech)->toBe(['Laravel', 'PostgreSQL']);
});

it('deletes portfolio items and redirects to the index', function (): void {
    actingPortfolioAdmin();

    $portfolioItem = createPortfolioItem();

    $this->mock(CloudinaryService::class)
        ->shouldReceive('deleteFromCloudinary')
        ->once()
        ->with('https://res.cloudinary.com/demo/image/upload/v1/portfolio/site.jpg');

    $this->delete(route('portfolio.destroy', $portfolioItem))
        ->assertRedirect(route('portfolio.index'))
        ->assertSessionHas('success', 'Portfolio item deleted successfully.');

    expect(PortfolioItem::query()->whereKey($portfolioItem->id)->exists())->toBeFalse();
});
