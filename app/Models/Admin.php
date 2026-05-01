<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Admin extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'email',
        'password_hash',
        'full_name',
        'is_active',
    ];

    protected $hidden = [
        'password_hash',
    ];

    public function otpTokens(): HasMany
    {
        return $this->hasMany(OtpToken::class);
    }
}
