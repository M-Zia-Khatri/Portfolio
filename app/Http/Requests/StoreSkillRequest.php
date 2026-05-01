<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreSkillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
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

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation failed.',
            'data' => null,
            'meta' => ['errors' => $validator->errors()],
        ], 422));
    }

}
