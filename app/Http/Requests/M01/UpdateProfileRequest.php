<?php

namespace App\Http\Requests\M01;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
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
        $userId = Auth::id();
        
        return [
            'name' => ['sometimes', 'string', 'min:2', 'max:100'],
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($userId),
            ],
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
            'name.min' => 'Name must be at least 2 characters',
            'name.max' => 'Name cannot exceed 100 characters',
            'email.email' => 'Please provide a valid email address',
            'email.unique' => 'This email is already taken',
        ];
    }
}