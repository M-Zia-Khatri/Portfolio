<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePortfolioRequest extends FormRequest
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
            'site_name' => ['sometimes', 'required', 'string', 'max:255'],
            'site_role' => ['sometimes', 'required', 'string', 'max:255'],
            'site_url' => ['sometimes', 'required', 'url', 'max:2048'],
            'site_image' => ['sometimes', 'required', 'file', 'image', 'max:5120'],
            'use_tech' => ['sometimes', 'required', 'array', 'min:1'],
            'use_tech.*' => ['required_with:use_tech', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
        ];
    }
}
