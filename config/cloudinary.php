<?php

/*
 * This file is part of the Laravel Cloudinary package.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

$cloudName = env('CLOUDINARY_CLOUD_NAME');
$apiKey = env('CLOUDINARY_API_KEY', env('CLOUDINARY_KEY'));
$apiSecret = env('CLOUDINARY_API_SECRET', env('CLOUDINARY_SECRET'));

$cloudUrl = env('CLOUDINARY_URL');

if (! is_string($cloudUrl) || $cloudUrl === '') {
    $cloudUrl = is_string($cloudName) && $cloudName !== ''
        && is_string($apiKey) && $apiKey !== ''
        && is_string($apiSecret) && $apiSecret !== ''
        ? 'cloudinary://'.$apiKey.':'.$apiSecret.'@'.$cloudName
        : null;
}

return [

    /*
    |--------------------------------------------------------------------------
    | Cloudinary Configuration
    |--------------------------------------------------------------------------
    |
    | An HTTP or HTTPS URL to notify your application (a webhook) when the process of uploads, deletes, and any API
    | that accepts notification_url has completed.
    |
    |
    */
    'notification_url' => env('CLOUDINARY_NOTIFICATION_URL'),

    /*
    |--------------------------------------------------------------------------
    | Cloudinary Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your Cloudinary settings. Cloudinary is a cloud hosted
    | media management service for all file uploads, storage, delivery and transformation needs.
    |
    |
    */
    'cloud_url' => $cloudUrl,

    /**
     * Upload Preset From Cloudinary Dashboard
     */
    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),

    /**
     * Route to get cloud_image_url from Blade Upload Widget
     */
    'upload_route' => env('CLOUDINARY_UPLOAD_ROUTE', '/cloudinary/upload'),

    /**
     * Controller action to get cloud_image_url from Blade Upload Widget
     */
    'upload_action' => env('CLOUDINARY_UPLOAD_ACTION', 'CloudinaryLabs\\CloudinaryLaravel\\Controller\\UploadWidgetController@process'),
];
