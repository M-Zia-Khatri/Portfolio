<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'fullName' => ['required', 'string', 'min:2'],
            'email' => ['required', 'email'],
            'message' => ['required', 'string', 'min:10'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'fullName' => trim((string) $this->input('fullName', $this->input('full_name'))),
            'email' => strtolower(trim((string) $this->input('email'))),
            'message' => trim((string) $this->input('message')),
        ]);
    }
}
