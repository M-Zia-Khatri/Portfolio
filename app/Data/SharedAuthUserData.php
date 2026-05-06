<?php

namespace App\Data;

use App\Models\Admin;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class SharedAuthUserData extends Data
{
    public function __construct(
        public int $id,
        public string $email,
        public string $fullName,
    ) {}

    public static function fromAdmin(Admin $admin): self
    {
        return new self(
            id: $admin->id,
            email: $admin->email,
            fullName: $admin->full_name,
        );
    }
}
