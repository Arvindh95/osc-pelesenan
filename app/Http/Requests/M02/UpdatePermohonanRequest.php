<?php

namespace App\Http\Requests\M02;

use App\Rules\CompanyOwnershipRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePermohonanRequest extends FormRequest
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
        return [
            'company_id' => [
                'sometimes',
                'exists:companies,id',
                new CompanyOwnershipRule(auth()->user()),
            ],
            'jenis_lesen_id' => 'sometimes|integer',
            'butiran_operasi' => 'sometimes|array',
            'butiran_operasi.alamat_premis' => 'sometimes|array',
            'butiran_operasi.alamat_premis.alamat_1' => 'sometimes|string|max:255',
            'butiran_operasi.alamat_premis.alamat_2' => 'nullable|string|max:255',
            'butiran_operasi.alamat_premis.bandar' => 'sometimes|string|max:100',
            'butiran_operasi.alamat_premis.poskod' => 'sometimes|string|max:10',
            'butiran_operasi.alamat_premis.negeri' => 'sometimes|string|max:100',
            'butiran_operasi.nama_perniagaan' => 'sometimes|string|max:255',
            'butiran_operasi.jenis_operasi' => 'nullable|string|max:255',
            'butiran_operasi.bilangan_pekerja' => 'nullable|integer|min:0',
            'butiran_operasi.catatan' => 'nullable|string',
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
            'company_id.exists' => 'The selected company does not exist.',
            'jenis_lesen_id.integer' => 'License type must be a valid number.',
            'butiran_operasi.alamat_premis.alamat_1.string' => 'Address line 1 must be text.',
            'butiran_operasi.alamat_premis.bandar.string' => 'City must be text.',
            'butiran_operasi.alamat_premis.poskod.string' => 'Postcode must be text.',
            'butiran_operasi.alamat_premis.negeri.string' => 'State must be text.',
            'butiran_operasi.nama_perniagaan.string' => 'Business name must be text.',
        ];
    }
}
