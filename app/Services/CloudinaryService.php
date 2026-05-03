<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use RuntimeException;

class CloudinaryService
{
    public function uploadToCloudinary(UploadedFile $file): string
    {
        $this->ensureCloudinaryIsConfigured();

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

        $publicId = $this->extractPublicIdFromUrl($url);

        if ($publicId === null) {
            return;
        }

        $this->ensureCloudinaryIsConfigured();

        Cloudinary::destroy($publicId);
    }


    private function ensureCloudinaryIsConfigured(): void
    {
        $cloudUrl = config('cloudinary.cloud_url');

        if (is_string($cloudUrl) && $cloudUrl !== '') {
            return;
        }

        throw new RuntimeException('Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
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
}
