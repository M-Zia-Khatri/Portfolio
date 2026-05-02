<?php

use App\Jobs\SendContactEmailJob;
use App\Models\Admin;
use App\Models\ContactMessage;
use App\Services\CloudinaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

function actingAsContactAdmin(): Admin
{
    $admin = Admin::query()->create([
        'email' => 'contact-admin@example.com',
        'password_hash' => Hash::make('password123'),
        'full_name' => 'Contact Admin',
        'is_active' => true,
    ]);

    test()->actingAs($admin, 'web');

    return $admin;
}

it('stores contact messages and dispatches a queued email job', function (): void {
    Queue::fake();

    $this->post(route('contact.submit'), [
        'full_name' => '  Jane Doe  ',
        'email' => '  JANE@EXAMPLE.COM  ',
        'message' => '  This is a valid contact message body.  ',
    ])->assertRedirect();

    $contactMessage = ContactMessage::query()->first();

    expect($contactMessage)->not->toBeNull();
    expect($contactMessage->full_name)->toBe('Jane Doe');
    expect($contactMessage->email)->toBe('jane@example.com');
    expect($contactMessage->message)->toBe('This is a valid contact message body.');
    expect($contactMessage->is_read)->toBeFalse();

    Queue::assertPushed(SendContactEmailJob::class);
});


it('stores contact image url when provided', function (): void {
    Queue::fake();

    $imageUrl = 'https://res.cloudinary.com/demo/image/upload/v1711111111/contacts/photo.jpg';

    $this->post(route('contact.submit'), [
        'full_name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'message' => 'This message includes an uploaded image URL.',
        'image_url' => $imageUrl,
    ])->assertRedirect();

    $contactMessage = ContactMessage::query()->first();

    expect($contactMessage)->not->toBeNull();
    expect($contactMessage->image_url)->toBe($imageUrl);
});

it('deletes uploaded cloudinary image when validation fails', function (): void {
    $imageUrl = 'https://res.cloudinary.com/demo/image/upload/v1711111111/contacts/invalid.jpg';

    $cloudinaryService = \Mockery::mock(CloudinaryService::class);
    $cloudinaryService->shouldReceive('deleteFromCloudinary')->once()->with($imageUrl);
    $this->app->instance(CloudinaryService::class, $cloudinaryService);

    $this->from(route('welcome'))->post(route('contact.submit'), [
        'full_name' => '',
        'email' => 'jane@example.com',
        'message' => 'short',
        'image_url' => $imageUrl,
    ])->assertRedirect(route('welcome'));

    expect(ContactMessage::query()->count())->toBe(0);
});

it('requires authentication for admin contact routes', function (): void {
    $this->get(route('admin.contact.index'))->assertRedirect(route('login'));
});

it('renders paginated contacts for admins', function (): void {
    actingAsContactAdmin();

    ContactMessage::factory()->count(25)->create();

    $this->get(route('admin.contact.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/contact/index')
            ->has('contacts', 20)
            ->where('meta.current_page', 1)
            ->where('meta.total', 25));
});

it('deletes a contact message for admins', function (): void {
    actingAsContactAdmin();

    $contactMessage = ContactMessage::factory()->create();

    $this->delete(route('admin.contact.destroy', $contactMessage->id))
        ->assertRedirect();

    expect(ContactMessage::query()->whereKey($contactMessage->id)->exists())->toBeFalse();
});
