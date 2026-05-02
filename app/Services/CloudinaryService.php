<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class CloudinaryService
{
    public function deleteFromCloudinary(string $url): void
    {
        $publicId = $this->extractPublicIdFromUrl($url);

        if (! $publicId) {
            return;
        }

        $cloudName = (string) config('services.cloudinary.cloud_name');
        $apiKey = (string) config('services.cloudinary.api_key');
        $apiSecret = (string) config('services.cloudinary.api_secret');

        if (! $cloudName || ! $apiKey || ! $apiSecret) {
            return;
        }

        Http::asForm()
            ->withBasicAuth($apiKey, $apiSecret)
            ->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/destroy", [
                'public_id' => $publicId,
                'invalidate' => true,
            ]);
    }

    private function extractPublicIdFromUrl(string $url): ?string
    {
        $path = parse_url($url, PHP_URL_PATH);

        if (! is_string($path)) {
            return null;
        }

        $segments = array_values(array_filter(explode('/', trim($path, '/'))));
        $uploadIndex = array_search('upload', $segments, true);

        if ($uploadIndex === false) {
            return null;
        }

        $assetSegments = array_slice($segments, $uploadIndex + 1);

        if ($assetSegments === []) {
            return null;
        }

        if (isset($assetSegments[0]) && preg_match('/^v\d+$/', $assetSegments[0]) === 1) {
            array_shift($assetSegments);
        }

        if ($assetSegments === []) {
            return null;
        }

        $lastSegment = array_pop($assetSegments);

        if (! is_string($lastSegment)) {
            return null;
        }

        $filenameWithoutExtension = pathinfo($lastSegment, PATHINFO_FILENAME);

        if ($filenameWithoutExtension === '') {
            return null;
        }

        $assetSegments[] = $filenameWithoutExtension;

        return implode('/', $assetSegments);
    }
}
