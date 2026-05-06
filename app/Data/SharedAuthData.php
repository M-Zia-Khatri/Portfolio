<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class SharedAuthData extends Data
{
    public function __construct(
        public ?SharedAuthUserData $user,
    ) {}
}
