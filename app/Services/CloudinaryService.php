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
        $cloudUrl = config('cloudinary.cloud_url');

        if (is_string($cloudUrl) && $cloudUrl !== '') {
            return;
        }

        $missingVariables = [];

        foreach (['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] as $variable) {
            $value = env($variable);

            if (! is_string($value) || $value === '') {
                $missingVariables[] = $variable;
            }
        }

        if ($missingVariables === []) {
            $missingVariables[] = 'CLOUDINARY_URL';
        }

        throw new RuntimeException('Cloudinary is not configured. Missing: '.implode(', ', $missingVariables));
    }
}
