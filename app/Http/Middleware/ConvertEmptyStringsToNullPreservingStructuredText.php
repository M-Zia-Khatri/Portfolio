<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Support\Str;

/**
 * Same as {@see ConvertEmptyStringsToNull}, but keeps empty strings under known
 * structured-text keys so multiline payloads (e.g. skill code lines) are not degraded to null.
 */
class ConvertEmptyStringsToNullPreservingStructuredText extends ConvertEmptyStringsToNull
{
    /**
     * Laravel builds dotted keys via {@see TransformsRequest::cleanValue} for nested arrays.
     *
     * @var array<int, string>
     */
    protected array $preserveEmptyStringKeyPatterns = [
        'code.*',
        'commands.*.text',
    ];

    /**
     * @param  mixed  $value
     */
    protected function transform($key, $value): mixed
    {
        foreach ($this->preserveEmptyStringKeyPatterns as $pattern) {
            if (Str::is($pattern, (string) $key)) {
                return $value;
            }
        }

        return parent::transform($key, $value);
    }
}
