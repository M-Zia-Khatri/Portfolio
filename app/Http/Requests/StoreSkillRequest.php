<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSkillRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['required', 'string', 'max:255'],
            'file_name' => ['required', 'string', 'max:255'],
            'lang' => ['required', 'string', 'max:255', 'unique:skills,lang'],
            'color' => ['required', 'string', 'max:255'],
            'mode' => ['required', Rule::in(['code', 'terminal'])],
            'code' => ['nullable', 'array', 'required_if:mode,code', 'prohibited_if:mode,terminal'],
            'code.*' => ['string'],
            'commands' => ['nullable', 'array', 'required_if:mode,terminal', 'prohibited_if:mode,code'],
            'commands.*.kind' => ['required_with:commands', Rule::in(['command', 'output', 'comment', 'blank'])],
            'commands.*.text' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.required_if' => 'Code is required when mode is code.',
            'code.prohibited_if' => 'Code must be empty when mode is terminal.',
            'commands.required_if' => 'Commands are required when mode is terminal.',
            'commands.prohibited_if' => 'Commands must be empty when mode is code.',
        ];
    }
}
