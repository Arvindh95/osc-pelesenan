<?php

namespace App\Http\Requests\M02;

use Illuminate\Foundation\Http\FormRequest;

class UploadDokumenRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware and policies
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Get max upload size from config and convert bytes to KB (integer)
        $maxUploadSizeKB = (int) (config('m02.files.max_upload_size', 10 * 1024 * 1024) / 1024);

        return [
            'keperluan_dokumen_id' => 'required|integer',
            'file' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:' . $maxUploadSizeKB,
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
        $maxUploadSizeMB = config('m02.files.max_upload_size', 10 * 1024 * 1024) / (1024 * 1024);

        return [
            'keperluan_dokumen_id.required' => 'Document requirement ID is required.',
            'keperluan_dokumen_id.integer' => 'Document requirement ID must be a valid number.',
            'file.required' => 'File is required.',
            'file.file' => 'The uploaded file is invalid.',
            'file.mimes' => 'File must be one of the following types: PDF, JPG, JPEG, PNG.',
            'file.max' => 'File size must not exceed ' . $maxUploadSizeMB . ' MB.',
        ];
    }
}
