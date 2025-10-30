<?php

namespace App\Http\Requests\M02;

use App\Rules\CompanyOwnershipRule;
use Illuminate\Foundation\Http\FormRequest;

class CreatePermohonanRequest extends FormRequest
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
                'required',
                'exists:companies,id',
                new CompanyOwnershipRule(auth()->user()),
            ],
            'jenis_lesen_id' => 'required|integer',
            'butiran_operasi' => 'required|array',
            'butiran_operasi.alamat_premis' => 'required|array',
            'butiran_operasi.alamat_premis.alamat_1' => 'required|string|max:255',
            'butiran_operasi.alamat_premis.alamat_2' => 'nullable|string|max:255',
            'butiran_operasi.alamat_premis.bandar' => 'required|string|max:100',
            'butiran_operasi.alamat_premis.poskod' => 'required|string|max:10',
            'butiran_operasi.alamat_premis.negeri' => 'required|string|max:100',
            'butiran_operasi.nama_perniagaan' => 'required|string|max:255',
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
            'company_id.required' => 'Company is required.',
            'company_id.exists' => 'The selected company does not exist.',
            'jenis_lesen_id.required' => 'License type is required.',
            'jenis_lesen_id.integer' => 'License type must be a valid number.',
            'butiran_operasi.required' => 'Business operation details are required.',
            'butiran_operasi.alamat_premis.required' => 'Premise address is required.',
            'butiran_operasi.alamat_premis.alamat_1.required' => 'Address line 1 is required.',
            'butiran_operasi.alamat_premis.bandar.required' => 'City is required.',
            'butiran_operasi.alamat_premis.poskod.required' => 'Postcode is required.',
            'butiran_operasi.alamat_premis.negeri.required' => 'State is required.',
            'butiran_operasi.nama_perniagaan.required' => 'Business name is required.',
        ];
    }
}
