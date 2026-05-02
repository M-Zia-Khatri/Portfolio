<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class CloudinaryService
{
    public function uploadToCloudinary(UploadedFile $file): string
    {
        $cloudName = (string) config('services.cloudinary.cloud_name');
        $uploadPreset = (string) config('services.cloudinary.upload_preset');

        $response = Http::asMultipart()
            ->attach('file', file_get_contents($file->getRealPath()) ?: '', $file->getClientOriginalName())
            ->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", [
                'upload_preset' => $uploadPreset,
                'folder' => config('services.cloudinary.folder', 'portfolio'),
            ]);

        if (! $response->successful() || ! is_string($response->json('secure_url'))) {
            throw new RuntimeException('Cloudinary upload failed.');
        }

        return $response->json('secure_url');
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

        $cloudName = (string) config('services.cloudinary.cloud_name');
        $apiKey = (string) config('services.cloudinary.api_key');
        $apiSecret = (string) config('services.cloudinary.api_secret');

        Http::asForm()
            ->withBasicAuth($apiKey, $apiSecret)
            ->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/destroy", [
                'public_id' => $publicId,
            ]);
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
