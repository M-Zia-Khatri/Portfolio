<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class SharedQuoteData extends Data
{
    public function __construct(
        public string $message,
        public string $author,
    ) {}
}
