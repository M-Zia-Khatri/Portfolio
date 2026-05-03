<?php

use App\Services\CloudinaryService;
use Illuminate\Http\UploadedFile;

uses(Tests\TestCase::class);

it('throws a descriptive exception when cloudinary config is missing', function () {
    config()->set('cloudinary.cloud_url', 'cloudinary://:@');

    putenv('CLOUDINARY_CLOUD_NAME');
    putenv('CLOUDINARY_API_KEY');
    putenv('CLOUDINARY_API_SECRET');
    putenv('CLOUDINARY_URL');

    $service = new CloudinaryService;

    expect(fn () => $service->uploadToCloudinary(UploadedFile::fake()->create('portfolio.jpg', 100, 'image/jpeg')))
        ->toThrow(RuntimeException::class, 'Cloudinary is not configured.');
});
