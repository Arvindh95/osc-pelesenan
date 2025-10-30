# Requirements Document

## Introduction

Module M02 Frontend extends the existing OSC Pelesenan PBT React application to enable verified applicants (Pemohon) to create, manage, and submit license applications through a user-friendly web interface. This module builds upon the M01 Frontend, which provides authentication, identity verification, company management, and base UI components. The frontend is developed using React 18, TypeScript, Vite, Tailwind CSS, and React Router v6.

## Glossary

- **Pemohon**: Verified applicant who submits license applications to PBT through the web interface
- **PBT**: Pihak Berkuasa Tempatan (Local Authority) that processes and approves license applications
- **Jenis Lesen**: License type category displayed in the UI and selected by users
- **Keperluan Dokumen**: Document requirements displayed to users for upload
- **Frontend Application**: The React-based web application that users interact with
- **M01 Frontend**: Base frontend module providing authentication, identity verification, and company management
- **M02 Backend**: Laravel API that handles license application business logic
- **Draft Application**: License application with status 'Draf' that can be edited
- **Submitted Application**: License application with status 'Diserahkan' that is read-only
- **Completeness Check**: Client-side validation ensuring all required fields and documents are present before submission
- **ApiClient**: Centralized service for making HTTP requests to the backend API

## Requirements

### Requirement 1

**User Story:** As a verified Pemohon, I want to view a list of my license applications, so that I can track their status and access them

#### Acceptance Criteria

1. THE Frontend Application SHALL display a list page at route /licenses showing all applications for the authenticated user
2. THE Frontend Application SHALL display application information including Jenis Lesen name, status badge, submission date, and action buttons
3. THE Frontend Application SHALL support filtering applications by keyword matching Jenis Lesen name
4. THE Frontend Application SHALL support filtering applications by status using dropdown selection
5. THE Frontend Application SHALL support filtering applications by submission date range using date pickers
6. THE Frontend Application SHALL sort applications by creation date in descending order by default
7. WHEN no applications exist, THE Frontend Application SHALL display an empty state with a call-to-action button to create new application
8. WHEN the list is loading, THE Frontend Application SHALL display a loading spinner
9. IF an error occurs while fetching applications, THEN THE Frontend Application SHALL display an error alert with retry option

### Requirement 2

**User Story:** As a Pemohon, I want to create a new license application, so that I can apply for a business license

#### Acceptance Criteria

1. THE Frontend Application SHALL provide a "Mohon Lesen Baharu" button on the licenses list page that navigates to /licenses/new
2. THE Frontend Application SHALL display a multi-step wizard with three steps: Maklumat Lesen, Butiran Premis, and Semak & Simpan
3. WHEN creating an application, THE Frontend Application SHALL fetch available Jenis Lesen options from the backend API
4. THE Frontend Application SHALL display Jenis Lesen selection with kategori and yuran proses information as read-only
5. THE Frontend Application SHALL validate that Jenis Lesen is selected before allowing navigation to next step
6. THE Frontend Application SHALL capture premise address fields including alamat_1, bandar, poskod, and negeri as required fields
7. THE Frontend Application SHALL compose structured address fields into butiran_operasi.alamat_premis object for backend submission
8. THE Frontend Application SHALL capture business operation details including nama_perniagaan as required field
8. THE Frontend Application SHALL display inline validation errors for required fields
10. THE Frontend Application SHALL prevent navigation to next step until current step validation passes
11. WHEN user completes the wizard and saves draft, THE Frontend Application SHALL navigate to /licenses/:id/edit and display success toast

### Requirement 3

**User Story:** As a Pemohon, I want to edit my draft application, so that I can update information and upload documents before submission

#### Acceptance Criteria

1. THE Frontend Application SHALL display an edit page at route /licenses/:id/edit with three tabs: Maklumat, Dokumen, and Serahan
2. IF application status is not 'Draf', THEN THE Frontend Application SHALL redirect to /licenses/:id details page
3. THE Frontend Application SHALL display Maklumat tab with editable form fields matching the create wizard
4. THE Frontend Application SHALL disable Jenis Lesen field if documents have already been uploaded
5. WHEN user saves changes in Maklumat tab, THE Frontend Application SHALL send update request to backend and display success toast
6. THE Frontend Application SHALL display Dokumen tab showing all required documents for the selected Jenis Lesen
7. THE Frontend Application SHALL provide exactly one upload slot per required document to prevent duplicate uploads
8. THE Frontend Application SHALL display file type and size constraints for each upload slot
9. THE Frontend Application SHALL validate file type is PDF, JPG, JPEG, or PNG before upload
10. THE Frontend Application SHALL validate file size does not exceed maximum configured size before upload
11. IF file validation fails, THEN THE Frontend Application SHALL display inline error message without sending request
12. WHEN file upload succeeds, THE Frontend Application SHALL display file name, size, and validation status
13. WHEN uploading to a slot that already has a document, THE Frontend Application SHALL replace the existing document
14. THE Frontend Application SHALL allow replacing uploaded documents while status is 'Draf'
15. THE Frontend Application SHALL display Serahan tab with completeness checklist showing required fields and documents status
16. THE Frontend Application SHALL enable "Hantar Permohonan" button only when all completeness checks pass
17. WHEN user clicks "Hantar Permohonan", THE Frontend Application SHALL display confirmation dialog with warning about editing lock

### Requirement 4

**User Story:** As a Pemohon, I want to submit my completed application, so that PBT can review and process my license request

#### Acceptance Criteria

1. WHEN user confirms submission in dialog, THE Frontend Application SHALL send submit request to backend API
2. IF submission succeeds, THEN THE Frontend Application SHALL navigate to /licenses/:id details page and display success toast
3. IF submission fails due to incompleteness, THEN THE Frontend Application SHALL display validation errors in alert
4. IF submission fails due to network error, THEN THE Frontend Application SHALL display error alert with retry option

### Requirement 5

**User Story:** As a Pemohon, I want to view details of a submitted application, so that I can review all information I provided

#### Acceptance Criteria

1. THE Frontend Application SHALL display a details page at route /licenses/:id showing all application information
2. THE Frontend Application SHALL display summary cards for Jenis Lesen, status badge, submission date, and company name
3. THE Frontend Application SHALL display documents section listing each requirement with submitted file and download link
4. IF application status is 'Draf', THEN THE Frontend Application SHALL display "Edit" and "Batal Permohonan" action buttons
5. IF application status is 'Diserahkan', THEN THE Frontend Application SHALL display info banner stating "Dalam proses semakan PBT"
6. IF application status is 'Diserahkan', THEN THE Frontend Application SHALL hide edit and cancel buttons
7. WHEN user clicks download link, THE Frontend Application SHALL open document in new browser tab

### Requirement 6

**User Story:** As a Pemohon, I want to cancel my draft application, so that I can remove applications I no longer need

#### Acceptance Criteria

1. WHEN user clicks "Batal Permohonan" button, THE Frontend Application SHALL display confirmation dialog
2. WHEN user confirms cancellation, THE Frontend Application SHALL send cancel request to backend API
3. IF cancellation succeeds, THEN THE Frontend Application SHALL navigate to /licenses list page and display success toast
4. IF cancellation fails, THEN THE Frontend Application SHALL display error alert

### Requirement 7

**User Story:** As a Pemohon, I want to navigate to license management from the dashboard, so that I can easily access my applications

#### Acceptance Criteria

1. THE Frontend Application SHALL add a "Lesen Saya" navigation item in the dashboard sidebar
2. WHEN user clicks "Lesen Saya", THE Frontend Application SHALL navigate to /licenses route
3. THE Frontend Application SHALL highlight the active navigation item when on license-related routes

### Requirement 8

**User Story:** As a developer, I want API client methods for M02 endpoints, so that I can make type-safe requests to the backend

#### Acceptance Criteria

1. THE Frontend Application SHALL extend ApiClient with getLicenses method accepting filter parameters
2. THE Frontend Application SHALL extend ApiClient with getLicense method accepting application ID
3. THE Frontend Application SHALL extend ApiClient with createLicense method accepting application payload
4. THE Frontend Application SHALL extend ApiClient with updateLicense method accepting application ID and payload
5. THE Frontend Application SHALL extend ApiClient with submitLicense method accepting application ID
6. THE Frontend Application SHALL extend ApiClient with cancelLicense method accepting application ID
7. THE Frontend Application SHALL extend ApiClient with uploadLicenseDocument method accepting application ID, file, and document type
8. THE Frontend Application SHALL extend ApiClient with getLicenseRequirements method accepting Jenis Lesen ID
9. THE Frontend Application SHALL handle 422 validation errors by extracting field-level errors
10. THE Frontend Application SHALL handle 403 authorization errors by displaying toast message
11. THE Frontend Application SHALL handle 401 authentication errors by redirecting to login page
12. THE Frontend Application SHALL handle network errors by displaying global error alert

### Requirement 9

**User Story:** As a developer, I want TypeScript type definitions for M02 data, so that I can ensure type safety throughout the application

#### Acceptance Criteria

1. THE Frontend Application SHALL define LicenseStatus type as union of 'Draf', 'Diserahkan', and 'Dibatalkan'
2. THE Frontend Application SHALL define License interface with all application fields including id, jenis_lesen_id, status, tarikh_serahan, butiran_operasi, and documents
3. THE Frontend Application SHALL define LicenseDocument interface with document metadata fields
4. THE Frontend Application SHALL define Requirement interface with document requirement fields
5. THE Frontend Application SHALL define ButiranOperasi interface with premise address and business details structure

### Requirement 10

**User Story:** As a user, I want consistent error handling across license pages, so that I understand what went wrong and how to fix it

#### Acceptance Criteria

1. WHEN a 422 validation error occurs, THE Frontend Application SHALL display inline field errors below form inputs
2. WHEN a 403 authorization error occurs, THE Frontend Application SHALL display toast message "Tidak dibenarkan"
3. WHEN a 401 authentication error occurs, THE Frontend Application SHALL redirect to login page
4. WHEN a network error occurs, THE Frontend Application SHALL display global Alert component with error message
5. THE Frontend Application SHALL reuse existing Alert, LoadingSpinner, and Toast components from M01

### Requirement 11

**User Story:** As a user, I want responsive and accessible license management pages, so that I can use the application on any device

#### Acceptance Criteria

1. THE Frontend Application SHALL use Tailwind CSS responsive utilities for mobile, tablet, and desktop layouts
2. THE Frontend Application SHALL ensure all interactive elements are keyboard accessible
3. THE Frontend Application SHALL provide appropriate ARIA labels for screen readers
4. THE Frontend Application SHALL reuse existing layout components from M01 including AppLayout
5. THE Frontend Application SHALL maintain consistent styling with M01 pages

### Requirement 12

**User Story:** As a user, I want visual feedback during file uploads, so that I know the upload is in progress

#### Acceptance Criteria

1. WHEN file upload is in progress, THE Frontend Application SHALL display a loading indicator on the upload button
2. WHEN file upload is in progress, THE Frontend Application SHALL disable the upload button
3. WHEN file upload completes, THE Frontend Application SHALL re-enable the upload button and display success feedback
4. WHEN file upload fails, THE Frontend Application SHALL display error message and re-enable the upload button

### Requirement 13

**User Story:** As a user, I want clear status badges for applications, so that I can quickly identify their current state

#### Acceptance Criteria

1. THE Frontend Application SHALL display 'Draf' status with gray badge
2. THE Frontend Application SHALL display 'Diserahkan' status with blue badge
3. THE Frontend Application SHALL display 'Dibatalkan' status with red badge
4. WHEN displaying 'Diserahkan' status in list views, THE Frontend Application SHALL optionally show "Permohonan Baru" label for user clarity
5. WHEN displaying 'Diserahkan' status in details view, THE Frontend Application SHALL show the true backend status without "Permohonan Baru" label

### Requirement 14

**User Story:** As a developer, I want protected routes for license pages, so that only authenticated users can access them

#### Acceptance Criteria

1. THE Frontend Application SHALL wrap all license routes with ProtectedRoute component from M01
2. IF user is not authenticated, THEN THE Frontend Application SHALL redirect to login page
3. THE Frontend Application SHALL preserve the intended destination URL for redirect after login

### Requirement 15

**User Story:** As a user, I want breadcrumb navigation on license pages, so that I can understand my location and navigate back easily

#### Acceptance Criteria

1. THE Frontend Application SHALL display breadcrumbs on all license pages using the Breadcrumb component from M01
2. THE Frontend Application SHALL show "Lesen Saya" as the root breadcrumb for license pages
3. THE Frontend Application SHALL show appropriate page titles in breadcrumbs (e.g., "Permohonan Baru", "Edit Permohonan", "Butiran Permohonan")

## Implementation Notes

### File Upload Configuration

- Maximum file size should be read from backend `/config` API endpoint or fallback to environment variable
- Default maximum: 10 MB
- Allowed types: PDF, JPG, JPEG, PNG
- Client-side validation should match backend validation rules
- Each document requirement has exactly one upload slot; uploading to an occupied slot replaces the existing file

### Address Field Composition

- UI captures structured address fields (alamat_1, alamat_2, bandar, poskod, negeri)
- These fields are composed into `butiran_operasi.alamat_premis` object for backend submission
- Backend completeness validation checks for presence of `butiran_operasi.alamat_premis`

### Status Display

- Backend status 'Diserahkan' may be displayed as "Permohonan Baru" label in list views for user clarity
- Details view shows the true backend status without the "Permohonan Baru" label
- This is presentation-only and does not affect backend state

### Reusable Components

- Leverage existing M01 components: Alert, LoadingSpinner, SubmitButton, ConfirmDialog, Breadcrumb, AppLayout, AuthLayout, ProtectedRoute
- Leverage existing M01 form components: FormField, SelectField, TextAreaField
- Leverage existing M01 contexts: AuthContext, NotificationContext
- Leverage existing M01 hooks: useForm, useErrorHandler

### API Integration

- All API calls should use the centralized ApiClient service
- Authentication tokens are handled automatically by ApiClient
- Error responses should be processed consistently across all pages

### Routing

- Use React Router v6 for all navigation
- Implement route guards using ProtectedRoute component
- Use programmatic navigation after successful mutations

### Form Validation

- Implement client-side validation matching backend rules
- Display inline errors below form fields
- Prevent form submission until validation passes
- Use React Hook Form for form state management

### Accessibility

- Ensure keyboard navigation works for all interactive elements
- Provide ARIA labels for screen readers
- Use semantic HTML elements
- Maintain sufficient color contrast for text and badges
