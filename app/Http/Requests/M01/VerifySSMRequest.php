<?php

namespace App\Http\Requests\M01;

use Illuminate\Foundation\Http\FormRequest;

class VerifySSMRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ssm_no' => 'required|string|max:50',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ssm_no.required' => 'The SSM number field is required.',
            'ssm_no.max' => 'The SSM number may not be greater than 50 characters.',
        ];
    }
}