<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class CloudinaryService
{
    public function deleteFromCloudinary(string $url): void
    {
        $publicId = $this->extractPublicIdFromUrl($url);

        if ($publicId === null) {
            return;
        }

        $cloudName = config('services.cloudinary.cloud_name');
        $apiKey = config('services.cloudinary.api_key');
        $apiSecret = config('services.cloudinary.api_secret');

        if (! is_string($cloudName) || ! is_string($apiKey) || ! is_string($apiSecret)) {
            return;
        }

        Http::asForm()
            ->withBasicAuth($apiKey, $apiSecret)
            ->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/destroy", [
                'public_id' => $publicId,
                'invalidate' => true,
            ])
            ->throw();
    }

    private function extractPublicIdFromUrl(string $url): ?string
    {
        $path = parse_url($url, PHP_URL_PATH);

        if (! is_string($path) || $path === '') {
            return null;
        }

        $segments = array_values(array_filter(explode('/', $path)));
        $uploadIndex = array_search('upload', $segments, true);

        if ($uploadIndex === false || ! isset($segments[$uploadIndex + 1])) {
            return null;
        }

        $publicIdSegments = array_slice($segments, $uploadIndex + 1);

        if (isset($publicIdSegments[0]) && preg_match('/^v\d+$/', $publicIdSegments[0]) === 1) {
            array_shift($publicIdSegments);
        }

        if ($publicIdSegments === []) {
            return null;
        }

        $lastSegment = array_pop($publicIdSegments);
        $lastSegmentWithoutExtension = Str::beforeLast($lastSegment, '.');
        $publicIdSegments[] = $lastSegmentWithoutExtension;

        return implode('/', $publicIdSegments);
    }
}
