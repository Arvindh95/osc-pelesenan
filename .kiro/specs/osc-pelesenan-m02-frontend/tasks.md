# Implementation Plan

## Module M02 Frontend – License Application Management

---

- [x] 1. Set up TypeScript type definitions for M02 data models





  - Create `resources/js/types/license.ts` with all interfaces
  - Define LicenseStatus, DocumentStatus, License, LicenseDocument, Requirement, JenisLesen, AlamatPremis, and ButiranOperasi types
  - Export all types for use across components
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 2. Extend API client with M02 endpoints




  - Add getLicenses method with filter parameters to `resources/js/services/apiClient.ts`
  - Add getLicense method for fetching single application
  - Add createLicense method for creating draft applications
  - Add updateLicense method for updating draft applications
  - Add submitLicense method for submitting applications
  - Add cancelLicense method for canceling draft applications
  - Add uploadLicenseDocument method with FormData handling
  - Add deleteLicenseDocument method for removing documents
  - Add getJenisLesen method for fetching license types catalog
  - Add getLicenseRequirements method for fetching document requirements
  - Ensure all endpoints use `/api/m02/...` prefix
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 3. Create utility helper functions





  - Create `resources/js/utils/fileHelpers.ts` with formatFileSize, getFileExtension, and isAllowedFileType functions
  - Create `resources/js/utils/dateHelpers.ts` with formatDate and formatDateTime functions
  - Create `resources/js/utils/currencyHelpers.ts` with formatCurrency function
  - _Requirements: 1.2, 5.2, 5.3_

- [x] 4. Create custom hooks for data fetching and file upload





  - Create `resources/js/hooks/useLicense.ts` hook for fetching single license with loading and error states
  - Create `resources/js/hooks/useLicenseRequirements.ts` hook for fetching document requirements
  - Create `resources/js/hooks/useFileUpload.ts` hook for handling file upload with validation and progress
  - _Requirements: 8.1, 8.2, 8.8, 12.1, 12.2_


- [x] 5. Create reusable license components





  - Create `resources/js/components/licenses/LicenseStatusBadge.tsx` with status styling and optional "Permohonan Baru" label
  - Create `resources/js/components/licenses/DocumentStatusBadge.tsx` for document validation status
  - Create `resources/js/components/licenses/DocumentUploadSlot.tsx` with file validation and upload handling
  - Create `resources/js/components/licenses/CompletenessChecklist.tsx` for validation status display
  - Create `resources/js/components/licenses/FilterBar.tsx` for list filtering controls
  - Create `resources/js/components/licenses/StepIndicator.tsx` for wizard progress display
  - Create `resources/js/components/licenses/TabNavigation.tsx` for edit page tabs
  - _Requirements: 1.2, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 12.1, 12.2, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 6. Implement LicensesListPage with filtering and pagination





  - Create `resources/js/pages/licenses/LicensesListPage.tsx` at route `/licenses`
  - Implement state management for licenses list, filters, pagination, loading, and error states
  - Create `resources/js/pages/licenses/components/LicenseTable.tsx` for displaying applications in table format
  - Implement FilterBar integration with keyword, status, and date range filters
  - Implement pagination controls with page change handling
  - Add empty state with "Mohon Lesen Baharu" CTA
  - Add loading spinner and error alert handling
  - Implement row click navigation to details page
  - Add "Edit" button for draft applications
  - Use LicenseStatusBadge with showNewLabel prop for list view
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 13.4_

- [x] 7. Implement LicenseCreatePage multi-step wizard





  - Create `resources/js/pages/licenses/LicenseCreatePage.tsx` at route `/licenses/new`
  - Create `resources/js/pages/licenses/components/Step1MaklumatLesen.tsx` for license type selection
  - Create `resources/js/pages/licenses/components/Step2ButiranPremis.tsx` for premise and business details
  - Create `resources/js/pages/licenses/components/Step3SemakSimpan.tsx` for summary and save
  - Implement step navigation with validation before proceeding
  - Fetch Jenis Lesen options from API and display with kategori and yuran proses
  - Implement structured address field capture (alamat_1, alamat_2, bandar, poskod, negeri)
  - Compose structured address fields into butiran_operasi.alamat_premis object before submission
  - Implement form validation matching backend rules
  - Handle save draft API call and navigate to edit page on success
  - Display success toast after saving
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11_
-

- [x] 8. Implement LicenseEditPage with tabbed interface




  - Create `resources/js/pages/licenses/LicenseEditPage.tsx` at route `/licenses/:id/edit`
  - Implement guard logic to redirect non-draft applications to details page
  - Create `resources/js/pages/licenses/components/MaklumatTab.tsx` for editing application info
  - Create `resources/js/pages/licenses/components/DokumenTab.tsx` for document management
  - Create `resources/js/pages/licenses/components/SerahanTab.tsx` for completeness check and submission
  - Implement tab navigation between Maklumat, Dokumen, and Serahan
  - Fetch license data and requirements on mount
  - Handle loading and error states
  - _Requirements: 3.1, 3.2_

- [x] 8.1 Implement Maklumat tab functionality







  - Display editable form with same fields as create wizard
  - Disable Jenis Lesen field if documents already uploaded
  - Implement "Simpan Perubahan" button with API call
  - Display success toast on save
  - Refresh license data after successful update
  - Handle validation errors from backend
  - _Requirements: 3.3, 3.4, 3.5_
-

- [x] 8.2 Implement Dokumen tab functionality






  - Fetch and display required documents for selected Jenis Lesen
  - Render DocumentUploadSlot for each requirement with exactly one slot per requirement
  - Display file type and size constraints for each slot
  - Implement client-side file validation before upload
  - Handle file upload with progress indicator
  - Display uploaded document info (name, size, status badge)
  - Implement replace functionality for existing documents
  - Implement delete functionality for unvalidated documents
  - Display success/error feedback per document operation
  - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14_



- [x] 8.3 Implement Serahan tab functionality










  - Display CompletenessChecklist with validation status
  - Check required fields presence (jenis_lesen_id, company_id, alamat_premis)
  - Check all required documents uploaded
  - Enable "Hantar Permohonan" button only when complete
  - Display confirmation dialog on submit button click
  - Handle submit API call
  - Navigate to details page on success with toast
  - Display validation errors if submission fails


  - _Requirements: 3.15, 3.16, 3.17, 4.1, 4.2, 4.3, 4.4_


- [x] 9. Implement LicenseDetailsPage for read-only view





  - Create `resources/js/pages/licenses/LicenseDetailsPage.tsx` at route `/licenses/:id`
  - Create `resources/js/pages/licenses/components/LicenseSummaryCard.tsx` for displaying application summary
  - Create `resources/js/pages/licenses/components/DocumentsSection.tsx` for displaying uploaded documents
  - Fetch license data and requirements on mount
  - Display summary with Jenis Lesen, kategori, status badge (without "Permohonan Baru" label), submission date, company, and business details
  - Display documents section with requirement names and uploaded files
  - Show download links for documents (open in new tab)
  - Display "Edit" and "Batal Permohonan" buttons for draft applications
  - Display info banner for submitted applications
  - Hide action buttons for submitted applications
  - Implement cancel confirmation dialog
  - Handle cancel API call and navigate to list on success
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.4, 13.5_


- [x] 10. Update navigation and routing






  - Add "Lesen Saya" navigation item to sidebar in `resources/js/components/layouts/AppLayout.tsx`
  - Add M02 routes to `resources/js/App.tsx` with ProtectedRoute wrapper
  - Configure routes: `/licenses`, `/licenses/new`, `/licenses/:id`, `/licenses/:id/edit`
  - Implement lazy loading for license page components with Suspense
  - Ensure active navigation highlighting for license routes
  - _Requirements: 7.1, 7.2, 7.3, 14.1, 14.2, 14.3_


- [x] 11. Implement error handling across all pages






  - Handle 422 validation errors with inline field errors
  - Handle 403 authorization errors with toast notification
  - Handle 401 authentication errors with redirect to login
  - Handle network errors with global Alert component
  - Reuse existing Alert, LoadingSpinner, and Toast components from M01
  - Implement consistent error handling pattern across all API calls

  - _Requirements: 8.9, 8.10, 8.11, 8.12, 10.1, 10.2, 10.3, 10.4, 10.5_
-

- [x] 12. Implement form validation





  - Define validation schema for create/update application forms
  - Implement client-side validation for required fields
  - Validate alamat_premis structure (alamat_1, bandar, poskod, negeri)
  - Validate poskod format (5 digits)
  - Validate nama_perniagaan presence
  - Implement file upload validation (type and size)
  - Display inline validation errors below form fields


  - Prevent form submission until validation passes
  - _Requirements: 2.5, 2.8, 2.9, 3.8, 3.9, 3.10_

- [x] 13. Implement accessibility features






  - Add ARIA labels to all interactive elements
  - Ensure keyboard navigation works for all components
  - Implement focus management for modal dialogs
  - Add role attributes for status badges and checklists

  - Ensure color contrast meets WCAG AA standards
  - Use semantic HTML elements throughout
  - Test with screen reader
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 14. Implement breadcrumb navigation






  - Add Breadcrumb component to all license pages
  - Display "Lesen Saya" as root breadcrumb
  - Display appropriate page titles in breadcrumbs
  - Ensure breadcrumbs are clickable and navigate correctly
  - _Requirements: 15.1, 15.2, 15.3_

-

- [x] 15. Add visual feedback for file uploads





  - Display loading indicator during upload
  - Disable upload button while uploading
  - Show success feedback after upload completes
  - Display error message if upload fails
  - Re-enable upload button after completion or error
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 16. Write unit tests for components






  - Test LicenseStatusBadge with different status values and showNewLabel prop
  - Test DocumentUploadSlot file validation logic
  - Test CompletenessChecklist validation logic
  - Test FilterBar state management
  - Test utility functions (formatFileSize, formatDate, formatCurrency)

- [x] 17. Write unit tests for custom hooks






  - Test useLicense hook with mock API calls
  - Test useLicenseRequirements hook caching behavior
  - Test useFileUpload hook validation and upload flow
  - Test loading and error states for all hooks


-

- [x]* 18. Write integration tests for user flows





  - Test complete application creation flow (wizard steps)
  - Test draft editing flow (all tabs)
  - Test document upload flow (validation, success, error)
  - Test application submission flow (completeness check, confirmation)
  - Test application cancellation flow (confirmation dialog)
  - Test list filtering and pagination
  - Test details view for different application statuses

- [x] 19. Perform accessibility testing






  - Test keyboard navigation for all pages
  - Test screen reader compatibility
  - Verify ARIA labels are present and correct
  - Check color contrast ratios
  - Test focus management in dialogs

- [x] 20. Test responsive layouts






  - Test mobile layout (320px - 767px)
  - Test tablet layout (768px - 1023px)
  - Test desktop layout (1024px+)
  - Verify all components are usable on small screens
  - Test touch interactions on mobile devices

