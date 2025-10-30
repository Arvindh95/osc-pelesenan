# Requirements Document

## Introduction

Module M02 – Permohonan Lesen oleh Pemohon extends the OSC Pelesenan PBT System to enable verified applicants (Pemohon) to create, manage, and submit license applications to local authorities (PBT) for processing. This module builds upon Module M01 (Profil Pelanggan), which provides authentication, identity verification, company management, and audit logging capabilities. The system is developed using Laravel 10 (PHP 8.2) with MySQL 8 database.

## Glossary

- **Pemohon**: Verified applicant who submits license applications to PBT
- **PBT**: Pihak Berkuasa Tempatan (Local Authority) that processes and approves license applications
- **Jenis Lesen**: License type category defined in Module 4 catalog
- **Keperluan Dokumen**: Document requirements associated with a specific Jenis Lesen
- **SSM**: Suruhanjaya Syarikat Malaysia (Companies Commission of Malaysia) registration document
- **Application System**: The OSC Pelesenan PBT backend system
- **AuditService**: Centralized service from Module M01 that logs all system actions
- **Module 4**: License catalog module that defines available license types and document requirements
- **Module 5**: PBT review queue module that receives submitted applications
- **Module 10**: Payment processing module that handles fees and auto-cancel timers
- **Module 12**: Notification module that sends email/SMS communications
- **Permohonan**: License application record
- **Permohonan Dokumen**: Document uploaded for a license application

## Requirements

### Requirement 1

**User Story:** As a verified Pemohon, I want to create a new license application, so that I can apply for a business license from PBT

#### Acceptance Criteria

1. WHEN a verified Pemohon initiates application creation, THE Application System SHALL create a new license application record with status 'Draf'
2. WHEN creating a new application, THE Application System SHALL pre-populate user identity and company information from Module M01 data
3. THE Application System SHALL assign a unique identifier to each created license application
4. WHEN an application is created, THE AuditService SHALL log the creation action with actor identity and timestamp

### Requirement 2

**User Story:** As a Pemohon, I want to select the type of license I need, so that the system shows me the correct requirements

#### Acceptance Criteria

1. THE Application System SHALL retrieve available license types from Module 4 catalog
2. WHEN a Pemohon selects a Jenis Lesen, THE Application System SHALL retrieve keperluan_dokumen based on the selected jenis_lesen_id
3. THE Application System SHALL cache the keperluan_dokumen list for 15 minutes to optimize performance
4. WHILE running in development environment, THE Application System SHALL provide a fallback list when the Module 4 registry cannot be reached
5. THE Application System SHALL store the selected Jenis Lesen identifier with the application record

### Requirement 3

**User Story:** As a Pemohon, I want to upload required documents for my application, so that PBT can review my supporting materials

#### Acceptance Criteria

1. WHEN a Pemohon uploads a document, THE Application System SHALL validate that file type is one of PDF, JPG, JPEG, or PNG
2. WHEN a Pemohon uploads a document, THE Application System SHALL validate that file size does not exceed the configured maximum upload size
3. IF file type is not allowed or file size exceeds the limit, THEN THE Application System SHALL reject the upload with an error message
4. WHEN a document upload succeeds, THE Application System SHALL create a permohonan_dokumen record with nama_fail, mime, saiz_bait, and url_storan
5. IF file integrity hashing is enabled, THEN THE Application System SHALL compute and store a file integrity hash with the permohonan_dokumen record
6. WHEN a document upload succeeds, THE Application System SHALL set status_sah to 'BelumSah'
7. THE Application System SHALL associate each uploaded document with the corresponding keperluan_dokumen_id from Module 4
8. WHEN a document is uploaded, THE Application System SHALL emit a DokumenDimuatNaik event with permohonan_dokumen_id
9. IF antivirus scanning is enabled, THEN THE Application System SHALL queue a scan job when handling the DokumenDimuatNaik event
10. WHEN a document is uploaded, THE AuditService SHALL log the upload action with uploader identity

### Requirement 4

**User Story:** As a Pemohon, I want to enter my business and premise details, so that PBT knows where my business will operate

#### Acceptance Criteria

1. THE Application System SHALL capture premise address information in structured format
2. THE Application System SHALL capture business operation details in JSON format
3. THE Application System SHALL validate that required business detail fields are provided
4. WHEN business details are saved, THE Application System SHALL store them with the application record

### Requirement 5

**User Story:** As a Pemohon, I want to save my application as a draft, so that I can complete it later

#### Acceptance Criteria

1. WHEN a Pemohon saves an incomplete application, THE Application System SHALL set the application status to 'Draf'
2. THE Application System SHALL allow multiple save operations while status remains 'Draf'
3. WHEN a draft is saved, THE AuditService SHALL log the save action
4. THE Application System SHALL retain all entered data when saving a draft

### Requirement 6

**User Story:** As a Pemohon, I want to edit my draft applications, so that I can update information before submission

#### Acceptance Criteria

1. WHILE application status is 'Draf', THE Application System SHALL allow the owning Pemohon to modify application data
2. IF application status is not 'Draf', THEN THE Application System SHALL prevent modification of application data
3. THE Application System SHALL validate ownership before allowing edit operations
4. WHEN a draft is edited, THE AuditService SHALL log the modification action

### Requirement 7

**User Story:** As a Pemohon, I want the system to check if my application is complete, so that I know if I can submit it

#### Acceptance Criteria

1. WHEN a Pemohon attempts to submit an application, THE Application System SHALL validate that all mandatory fields contain data
2. WHEN validating completeness, THE Application System SHALL validate that butiran_operasi.alamat_premis is present and non-empty
3. WHEN validating completeness, THE Application System SHALL verify that all required documents for the selected Jenis Lesen are uploaded
4. IF mandatory data is missing, THEN THE Application System SHALL return a validation error listing incomplete requirements
5. THE Application System SHALL prevent submission of incomplete applications

### Requirement 8

**User Story:** As a Pemohon, I want to submit my completed application to PBT, so that they can review and process my license request

#### Acceptance Criteria

1. WHEN a Pemohon submits a complete application, THE Application System SHALL change the status from 'Draf' to 'Diserahkan'
2. WHEN submission succeeds, THE Application System SHALL record the submission timestamp in tarikh_serahan field
3. WHEN an application is submitted, THE Application System SHALL emit a PermohonanDiserahkan event
4. WHEN the PermohonanDiserahkan event is emitted, THE Application System SHALL forward the application to Module 5 review queue
5. WHEN submission completes, THE AuditService SHALL log the submission action
6. WHEN an application is submitted, THE Application System SHALL trigger Module 12 to send confirmation notification to the Pemohon

### Requirement 9

**User Story:** As a Pemohon, I want to cancel my draft application, so that I can remove applications I no longer need

#### Acceptance Criteria

1. WHILE application status is 'Draf', THE Application System SHALL allow the owning Pemohon to cancel the application
2. IF application status is not 'Draf', THEN THE Application System SHALL prevent cancellation
3. WHEN an application is cancelled, THE Application System SHALL set status to 'Dibatalkan'
4. WHEN an application is cancelled, THE Application System SHALL retain the record for audit purposes
5. WHEN cancellation occurs, THE AuditService SHALL log the cancellation action with reason

### Requirement 10

**User Story:** As a Pemohon, I want to view a list of my applications, so that I can track their status

#### Acceptance Criteria

1. THE Application System SHALL display only applications owned by the authenticated Pemohon
2. THE Application System SHALL support filtering applications by status
3. THE Application System SHALL support filtering applications by submission date range
4. THE Application System SHALL support filtering applications by Jenis Lesen
5. THE Application System SHALL paginate application lists with configurable page size
6. THE Application System SHALL display key information including application ID, Jenis Lesen, status, and submission date

### Requirement 11

**User Story:** As a Pemohon, I want to view details of a specific application, so that I can review all information I submitted

#### Acceptance Criteria

1. WHEN a Pemohon requests application details, THE Application System SHALL verify ownership before displaying data
2. THE Application System SHALL display all application fields including business details and premise information
3. THE Application System SHALL display all uploaded documents with their current status
4. THE Application System SHALL display submission timestamp if application has been submitted

### Requirement 12

**User Story:** As a system administrator, I want Module M02 controlled by a feature flag, so that I can enable or disable it independently

#### Acceptance Criteria

1. THE Application System SHALL check MODULE_M02 feature flag before processing any Module M02 requests
2. IF MODULE_M02 feature flag is false, THEN THE Application System SHALL return a feature disabled error
3. THE Application System SHALL read the feature flag from environment configuration

### Requirement 13

**User Story:** As a system administrator, I want all Module M02 actions logged, so that I can audit user activities and troubleshoot issues

#### Acceptance Criteria

1. WHEN any application mutation occurs, THE AuditService SHALL log the action type, actor identity, timestamp, and affected resource
2. THE Application System SHALL log application creation, updates, submission, and cancellation events
3. THE Application System SHALL log document upload events with file metadata
4. THE AuditService SHALL store audit logs in a format consistent with Module M01 standards

### Requirement 14

**User Story:** As a database administrator, I want Module M02 tables to follow OSC database standards, so that the system maintains consistency and performance

#### Acceptance Criteria

1. THE Application System SHALL use UUID (CHAR(36)) as primary keys for permohonan and permohonan_dokumen tables
2. THE Application System SHALL use InnoDB engine for all Module M02 tables
3. THE Application System SHALL use utf8mb4_unicode_ci collation for all Module M02 tables
4. THE Application System SHALL create indexes on foreign key columns including user_id, company_id, jenis_lesen_id, permohonan_id, and keperluan_dokumen_id
5. THE Application System SHALL create an index on the status column of permohonan table
6. THE Application System SHALL enforce foreign key constraints with appropriate cascade or restrict rules

### Requirement 15

**User Story:** As a developer, I want sample data seeders for development, so that I can test the application without depending on Module 4 in local environments

#### Acceptance Criteria

1. THE Application System SHALL provide a JenisLesenSeeder to populate sample jenis_lesen records
2. THE Application System SHALL provide a KeperluanDokumenSeeder to populate sample document requirements
3. WHILE running in non-production environments, THE Application System SHALL allow seeders to execute
4. WHILE running in production environment, THE Application System SHALL prevent seeder execution
5. THE Application System SHALL document that production catalog data is managed through Module 4


## Implementation Notes

### Status Labels vs Backend State

- Backend workflow state on submission is **Diserahkan**
- UI may display the label **"Permohonan Baru"** in application lists for user clarity
- This is a presentation-layer label only and does not affect backend state management

### Payment and Auto-Cancel Logic

- Payment processing and auto-cancel timers are handled by **Module 10**
- Module M02 must not implement payment or timeout logic
- Module M02 is responsible only for application creation, editing, and submission to PBT

### File Upload Configuration

- Default maximum upload size: **10 MB**
- Configurable via `config('files.max_upload_size', 10 * 1024 * 1024)`
- Allowed file types: **PDF, JPG, JPEG, PNG**

### Module 4 Integration

- Jenis Lesen catalog is dynamic and retrieved from Module 4
- Document requirements (keperluan_dokumen) are associated with license types, not separate license types themselves
- Cache keperluan_dokumen for 15 minutes to reduce API calls
- Development environments should provide fallback data when Module 4 is unavailable

### Antivirus Scanning

- Document upload emits **DokumenDimuatNaik** event
- If AV scanning is enabled, a scan job is queued on event handling
- AV scanning is optional and controlled by system configuration
