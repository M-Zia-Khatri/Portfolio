<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioItem extends Model
{
    /** @use HasFactory<\Database\Factories\PortfolioItemFactory> */
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'site_name',
        'site_role',
        'site_url',
        'site_image_url',
        'use_tech',
        'description',
    ];

    public function getSiteNameAttribute(?string $value): ?string
    {
        return $value;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'use_tech' => 'array',
        ];
    }
}
