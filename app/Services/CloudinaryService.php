<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use RuntimeException;

class CloudinaryService
{
    public function uploadToCloudinary(UploadedFile $file): string
    {
        $this->ensureCloudinaryConfigurationIsComplete();

        $result = Cloudinary::upload($file->getRealPath(), [
            'folder' => config('services.cloudinary.folder', 'portfolio'),
        ]);

        return (string) $result->getSecurePath();
    }

    public function deleteFromCloudinary(?string $url): void
    {
        if (! is_string($url) || $url === '') {
            return;
        }

        $this->ensureCloudinaryConfigurationIsComplete();

        $publicId = $this->extractPublicIdFromUrl($url);

        if ($publicId === null) {
            return;
        }

        Cloudinary::destroy($publicId);
    }

    private function extractPublicIdFromUrl(string $url): ?string
    {
        $path = (string) parse_url($url, PHP_URL_PATH);

        if ($path === '') {
            return null;
        }

        $segments = explode('/', trim($path, '/'));
        $uploadIndex = array_search('upload', $segments, true);

        if ($uploadIndex === false) {
            return null;
        }

        $publicIdParts = array_slice($segments, $uploadIndex + 2);

        if ($publicIdParts === []) {
            return null;
        }

        $fileName = array_pop($publicIdParts);

        if (! is_string($fileName)) {
            return null;
        }

        $publicIdParts[] = pathinfo($fileName, PATHINFO_FILENAME);

        return implode('/', $publicIdParts);
    }

    private function ensureCloudinaryConfigurationIsComplete(): void
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');
        $cloudinaryUrl = env('CLOUDINARY_URL');

        $missingVariables = [];

        if (! is_string($cloudName) || $cloudName === '') {
            $missingVariables[] = 'CLOUDINARY_CLOUD_NAME';
        }

        if (! is_string($apiKey) || $apiKey === '') {
            $missingVariables[] = 'CLOUDINARY_API_KEY';
        }

        if (! is_string($apiSecret) || $apiSecret === '') {
            $missingVariables[] = 'CLOUDINARY_API_SECRET';
        }

        if (! is_string($cloudinaryUrl) || $cloudinaryUrl === '') {
            $missingVariables[] = 'CLOUDINARY_URL';
        }

        if ($missingVariables !== []) {
            throw new RuntimeException('Cloudinary is not configured. Missing: '.implode(', ', $missingVariables));
        }
    }
}
