<?php

use App\Services\CloudinaryService;
use Illuminate\Http\UploadedFile;

it('throws a descriptive exception when cloudinary config is missing', function () {
    config()->set('cloudinary.cloud_url', null);

    $service = new CloudinaryService;

    expect(fn () => $service->uploadToCloudinary(UploadedFile::fake()->image('portfolio.jpg')))
        ->toThrow(RuntimeException::class, 'Cloudinary is not configured.');
});
