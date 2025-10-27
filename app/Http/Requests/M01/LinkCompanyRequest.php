<?php

namespace App\Http\Requests\M01;

use Illuminate\Foundation\Http\FormRequest;

class LinkCompanyRequest extends FormRequest
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
            'company_id' => 'required|integer|exists:companies,id',
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
            'company_id.required' => 'The company ID field is required.',
            'company_id.integer' => 'The company ID must be an integer.',
            'company_id.exists' => 'The selected company does not exist.',
        ];
    }
}