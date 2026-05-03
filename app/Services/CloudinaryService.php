<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use RuntimeException;

class CloudinaryService
{
    public function uploadToCloudinary(UploadedFile $file): string
    {
        $cloudinary = $this->makeCloudinaryClient();

        $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
            'folder' => config('services.cloudinary.folder', 'portfolio'),
        ]);

        return (string) ($result['secure_url'] ?? '');
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

        $cloudinary = $this->makeCloudinaryClient();
        $cloudinary->uploadApi()->destroy($publicId);
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

    private function makeCloudinaryClient(): Cloudinary
    {
        $cloudName = (string) env('CLOUDINARY_CLOUD_NAME', '');
        $apiKey = (string) env('CLOUDINARY_API_KEY', '');
        $apiSecret = (string) env('CLOUDINARY_API_SECRET', '');

        $missingVariables = [];

        if ($cloudName === '') {
            $missingVariables[] = 'CLOUDINARY_CLOUD_NAME';
        }

        if ($apiKey === '') {
            $missingVariables[] = 'CLOUDINARY_API_KEY';
        }

        if ($apiSecret === '') {
            $missingVariables[] = 'CLOUDINARY_API_SECRET';
        }

        if ($missingVariables !== []) {
            throw new RuntimeException('Cloudinary is not configured. Missing: '.implode(', ', $missingVariables));
        }

        return new Cloudinary([
            'cloud' => [
                'cloud_name' => $cloudName,
                'api_key' => $apiKey,
                'api_secret' => $apiSecret,
            ],
            'url' => [
                'secure' => true,
            ],
        ]);
    }
}
