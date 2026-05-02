<?php

namespace App\Http\Requests;

use App\Services\CloudinaryService;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'min:2'],
            'email' => ['required', 'email'],
            'message' => ['required', 'string', 'min:10'],
            'image_url' => ['nullable', 'url'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'full_name' => trim((string) $this->input('full_name')),
            'email' => strtolower(trim((string) $this->input('email'))),
            'message' => trim((string) $this->input('message')),
            'image_url' => $this->input('image_url') ? trim((string) $this->input('image_url')) : null,
        ]);
    }

    protected function failedValidation(Validator $validator): void
    {
        $imageUrl = $this->input('image_url');

        if (is_string($imageUrl) && $imageUrl !== '') {
            app(CloudinaryService::class)->deleteFromCloudinary($imageUrl);
        }

        throw new ValidationException($validator, $this->buildFailedValidationResponse($validator));
    }
}
