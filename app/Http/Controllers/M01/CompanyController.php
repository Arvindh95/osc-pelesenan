<?php

namespace App\Http\Controllers\M01;

use App\Http\Controllers\Controller;
use App\Http\Requests\M01\LinkCompanyRequest;
use App\Http\Requests\M01\VerifySSMRequest;
use App\Http\Resources\M01\CompanyResource;
use App\Models\Company;
use App\Services\M01\CompanyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyController extends Controller
{
    public function __construct(
        private CompanyService $companyService
    ) {}

    /**
     * Verify SSM number and create/update company record.
     *
     * @param VerifySSMRequest $request
     * @return JsonResponse
     */
    public function verifySSM(VerifySSMRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $ssmNo = $request->validated()['ssm_no'];

            $company = $this->companyService->verifyAndCreateCompany($ssmNo, $user);

            return response()->json([
                'message' => 'SSM verification completed.',
                'company' => new CompanyResource($company),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'SSM verification failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Link authenticated user to a company.
     *
     * @param LinkCompanyRequest $request
     * @return JsonResponse
     */
    public function linkCompany(LinkCompanyRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $companyId = $request->validated()['company_id'];

            // Check authorization policy before linking
            $company = Company::findOrFail($companyId);
            $this->authorize('link', $company);

            $company = $this->companyService->linkUserToCompany($user, $companyId);

            return response()->json([
                'message' => 'Company linked successfully',
                'company' => new CompanyResource($company->load('owner')),
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            // Let authorization exceptions bubble up to Laravel's handler
            throw $e;
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => 'Company linking failed.',
                'error' => $e->getMessage(),
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Company linking failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all companies (admin only).
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check authorization policy for viewing all companies
            $this->authorize('viewAny', Company::class);

            $companies = $this->companyService->getAllCompanies($user);

            return response()->json([
                'companies' => CompanyResource::collection($companies),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => 'Access denied.',
                'error' => $e->getMessage(),
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve companies.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get companies owned by the authenticated user.
     *
     * @return JsonResponse
     */
    public function myCompanies(): JsonResponse
    {
        try {
            $user = Auth::user();
            $companies = $this->companyService->getUserCompanies($user);

            return response()->json([
                'companies' => CompanyResource::collection($companies),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve your companies.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available companies that the authenticated user has verified but not yet linked.
     * Accessible to verified users.
     *
     * @return JsonResponse
     */
    public function available(): JsonResponse
    {
        try {
            $user = Auth::user();
            $companies = $this->companyService->getAvailableCompanies($user);

            return response()->json([
                'companies' => CompanyResource::collection($companies),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve available companies.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}