<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'site_name' => ['required', 'string', 'max:255'],
            'site_role' => ['required', 'string', 'max:255'],
            'site_url' => ['required', 'url', 'max:2048'],
            'site_image' => ['required', 'file', 'image', 'max:5120'],
            'use_tech' => ['required', 'array', 'min:1'],
            'use_tech.*' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
        ];
    }
}
