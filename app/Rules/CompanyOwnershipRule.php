<?php

namespace App\Rules;

use App\Models\Company;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CompanyOwnershipRule implements ValidationRule
{
    /**
     * Create a new rule instance.
     */
    public function __construct(
        private User $user
    ) {}

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $company = Company::find($value);

        if (!$company) {
            $fail('The selected company does not exist.');
            return;
        }

        if ($company->owner_user_id !== $this->user->id) {
            $fail('The selected company does not belong to the authenticated user.');
        }
    }
}
