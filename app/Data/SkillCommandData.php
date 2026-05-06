<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class SkillCommandData extends Data
{
    public function __construct(
        public string $kind,
        public ?string $text,
    ) {}
}
