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
            'siteName' => ['required', 'string', 'max:255'],
            'siteRole' => ['required', 'string', 'max:255'],
            'siteUrl' => ['required', 'url', 'max:2048'],
            'siteImage' => ['required', 'file', 'image', 'max:5120'],
            'useTech' => ['required', 'array', 'min:1'],
            'useTech.*' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'siteName' => $this->input('siteName', $this->input('site_name')),
            'siteRole' => $this->input('siteRole', $this->input('site_role')),
            'siteUrl' => $this->input('siteUrl', $this->input('site_url')),
            'siteImage' => $this->file('siteImage', $this->file('site_image')),
            'useTech' => $this->input('useTech', $this->input('use_tech')),
        ]);
    }
}
