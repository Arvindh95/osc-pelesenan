<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class CompanyService
{
    public function __construct(
        private MockSSMClient $ssmClient,
        private AuditService $auditService
    ) {}

    /**
     * Verify SSM number and create or update company record.
     *
     * @param string $ssmNo The SSM number to verify
     * @param User|null $actor The user performing the verification (for audit logging)
     * @return Company
     */
    public function verifyAndCreateCompany(string $ssmNo, ?User $actor = null): Company
    {
        // Call MockSSMClient to verify company status
        $statusResult = $this->ssmClient->checkCompanyStatus($ssmNo);
        
        // Create or update company based on verification result
        $company = $this->createOrUpdateCompany(
            $ssmNo,
            $statusResult->getStatus(),
            $statusResult->getCompanyName()
        );

        // Log the company verification event
        if ($actor) {
            $this->auditService->logCompanyEvent(
                $actor,
                'company_verified',
                $company,
                [
                    'ssm_no' => $ssmNo,
                    'verification_status' => $statusResult->getStatus(),
                    'company_name' => $statusResult->getCompanyName(),
                    'verification_metadata' => $statusResult->getMetadata(),
                ]
            );
        }

        return $company;
    }

    /**
     * Link a user to a company as the owner.
     *
     * @param User $user The user to link to the company
     * @param int $companyId The ID of the company to link
     * @return Company
     * @throws ModelNotFoundException If company is not found
     * @throws \InvalidArgumentException If company already has an owner and user is not admin
     */
    public function linkUserToCompany(User $user, int $companyId): Company
    {
        return DB::transaction(function () use ($user, $companyId) {
            // Find the company
            $company = Company::findOrFail($companyId);

            // Validate ownership permissions
            $this->validateOwnershipPermissions($user, $company);

            // Update company ownership
            $company->update(['owner_user_id' => $user->id]);

            // Log the company linking event
            $this->auditService->logCompanyEvent(
                $user,
                'company_linked',
                $company,
                [
                    'company_id' => $companyId,
                    'ssm_no' => $company->ssm_no,
                    'company_name' => $company->name,
                    'previous_owner_id' => $company->getOriginal('owner_user_id'),
                ]
            );

            return $company->fresh();
        });
    }

    /**
     * Get all companies (admin only functionality).
     *
     * @param User $user The user requesting the companies list
     * @return \Illuminate\Database\Eloquent\Collection
     * @throws \InvalidArgumentException If user is not admin
     */
    public function getAllCompanies(User $user): \Illuminate\Database\Eloquent\Collection
    {
        if ($user->role !== 'PENTADBIR_SYS') {
            throw new \InvalidArgumentException('Only administrators can view all companies');
        }

        return Company::with('owner')->get();
    }

    /**
     * Get companies owned by a specific user.
     *
     * @param User $user The user whose companies to retrieve
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserCompanies(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return $user->ownedCompanies()->get();
    }

    /**
     * Create or update company record based on SSM verification.
     *
     * @param string $ssmNo The SSM number
     * @param string $status The verification status (active, inactive, unknown)
     * @param string|null $companyName The company name from verification
     * @return Company
     */
    private function createOrUpdateCompany(string $ssmNo, string $status, ?string $companyName): Company
    {
        // Try to find existing company by SSM number
        $company = Company::where('ssm_no', $ssmNo)->first();

        $companyData = [
            'ssm_no' => $ssmNo,
            'status' => $status,
        ];

        // Only update name if we have a valid company name from verification
        if ($companyName !== null) {
            $companyData['name'] = $companyName;
        }

        if ($company) {
            // Update existing company
            $company->update($companyData);
            return $company->fresh();
        } else {
            // Create new company
            // For new companies, we need a name. If verification didn't provide one, use a default
            if (!isset($companyData['name'])) {
                $companyData['name'] = "Company {$ssmNo}";
            }

            return Company::create($companyData);
        }
    }

    /**
     * Validate if user can link to the specified company.
     *
     * @param User $user The user attempting to link
     * @param Company $company The company to link to
     * @throws \InvalidArgumentException If user cannot link to the company
     */
    private function validateOwnershipPermissions(User $user, Company $company): void
    {
        // If company already has an owner
        if ($company->owner_user_id !== null) {
            // Only allow if user is admin (PENTADBIR_SYS) or is already the owner
            if ($user->role !== 'PENTADBIR_SYS' && $company->owner_user_id !== $user->id) {
                throw new \InvalidArgumentException('Company already has an owner. Only administrators can reassign ownership.');
            }
        }

        // Additional validation: company should exist and be in a valid state
        if ($company->status === 'unknown') {
            throw new \InvalidArgumentException('Cannot link to a company with unknown status. Please verify the company first.');
        }
    }
}