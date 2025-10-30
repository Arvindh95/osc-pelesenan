# Implementation Plan

## Module M02 – Permohonan Lesen oleh Pemohon

---

- [x] 1. Set up database schema and migrations




- [x] 1.1 Create migration for permohonan table with UUID primary key, foreign keys, indexes, and JSON column for butiran_operasi


  - Use InnoDB engine and utf8mb4_unicode_ci collation
  - Add indexes on user_id, company_id, jenis_lesen_id, status, tarikh_serahan, created_at
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_


- [x] 1.2 Create migration for permohonan_dokumen table with UUID primary key, foreign keys, and unique constraint



  - Include fields: nama_fail, mime, saiz_bait, url_storan, hash_fail (nullable), status_sah
  - Add unique constraint on (permohonan_id, keperluan_dokumen_id) to prevent duplicate uploads
  - Add indexes on permohonan_id, keperluan_dokumen_id, status_sah
  - _Requirements: 3.4, 3.5, 3.6, 14.1, 14.2, 14.3, 14.4_

- [x] 2. Create Eloquent models with relationships and scopes






- [x] 2.1 Implement Permohonan model with HasUuids trait, relationships, scopes, and status helper methods

  - Define fillable fields and casts (butiran_operasi as array, tarikh_serahan as datetime)
  - Add relationships: user(), company(), dokumen()
  - Add scopes: draf(), diserahkan(), forUser()
  - Add helper methods: isDraf(), isDiserahkan()
  - _Requirements: 1.1, 1.3, 5.1, 6.1_

- [x] 2.2 Implement PermohonanDokumen model with HasUuids trait and relationships


  - Define fillable fields for document metadata
  - Add relationships: permohonan(), uploader()
  - _Requirements: 3.4, 3.5, 3.6_
-

- [x] 3. Implement Module 4 integration client





- [x] 3.1 Create Module4Client service to fetch jenis_lesen catalog and keperluan_dokumen with caching

  - Implement getJenisLesen() method with 15-minute cache
  - Implement getKeperluanDokumen($jenisLesenId) method with 15-minute cache
  - Add development fallback when Module 4 is unavailable
  - Configure timeout of 10 seconds for HTTP requests
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3.2 Create config file config/m02.php for module configuration


  - Define module4 settings (base_url, cache_ttl)
  - Define file upload settings (disk, max_upload_size, allowed_mimes, integrity_hash_enabled)
  - Define antivirus settings (enabled, queue)
  - _Requirements: 12.3_

- [x] 4. Implement core service layer for application management





- [x] 4.1 Create PermohonanService with createDraft() method


  - Validate company_id belongs to authenticated user
  - Validate jenis_lesen_id exists via Module4Client
  - Pre-populate user_id and company_id
  - Create permohonan with status 'Draf'
  - Log creation via AuditService
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4.2 Implement updateDraft() method in PermohonanService


  - Validate permohonan status is 'Draf'
  - If company_id is being changed, validate it belongs to user
  - If jenis_lesen_id is being changed, validate it exists via Module4Client
  - Update permohonan fields
  - Log update via AuditService
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4.3 Implement validateCompleteness() method in PermohonanService


  - Check all mandatory fields are present
  - Validate butiran_operasi.alamat_premis exists and is non-empty
  - Fetch keperluan_dokumen from Module4Client (cached)
  - Verify all required documents are uploaded
  - Return array of validation errors or empty array
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4.4 Implement submit() method in PermohonanService


  - Call validateCompleteness() and throw exception if incomplete
  - Change status from 'Draf' to 'Diserahkan'
  - Set tarikh_serahan to current timestamp
  - Emit PermohonanDiserahkan event
  - Log submission via AuditService
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 4.5 Implement cancel() method in PermohonanService


  - Validate permohonan status is 'Draf'
  - Change status to 'Dibatalkan'
  - Log cancellation via AuditService with reason
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
-

- [x] 5. Implement document upload service





- [x] 5.1 Create DokumenService with upload() method

  - Validate file type is one of: PDF, JPG, JPEG, PNG
  - Validate file size does not exceed configured max_upload_size
  - Check if document already exists for keperluan_dokumen_id (replace if exists)
  - Store file to configured filesystem disk
  - Compute SHA-256 hash if integrity_hash_enabled is true
  - Create permohonan_dokumen record with metadata
  - Set status_sah to 'BelumSah'
  - Emit DokumenDimuatNaik event
  - Log upload via AuditService
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.10_


- [x] 5.2 Implement delete() method in DokumenService

  - Validate permohonan status is 'Draf'
  - Validate document status_sah is 'BelumSah' (cannot delete validated documents)
  - Delete file from storage
  - Delete permohonan_dokumen record
  - Log deletion via AuditService
  - _Requirements: 6.1_
-

- [x] 6. Create custom exceptions for error handling





- [x] 6.1 Implement custom exception classes with render() methods

  - PermohonanNotDrafException (422)
  - PermohonanIncompleteException (422, includes validation errors)
  - InvalidFileTypeException (422)
  - FileSizeExceededException (422)
  - CompanyNotOwnedException (403)
  - IdentityNotVerifiedException (403)
  - DocumentAlreadyValidatedException (422)
  - _Requirements: 3.2, 3.3, 7.4_


- [x] 7. Implement authorization policies






- [x] 7.1 Create PermohonanPolicy with authorization methods

  - Implement view() method (check ownership)
  - Implement update() method (check ownership and status is 'Draf')
  - Implement submit() method (check ownership, status is 'Draf', and user identity is verified)
  - Implement cancel() method (check ownership and status is 'Draf')
  - _Requirements: 6.1, 6.2, 6.3, 8.1, 9.1, 9.2, 11.1_

- [x] 7.2 Register PermohonanPolicy in AuthServiceProvider



  - _Requirements: 6.3_
-

- [x] 8. Create form request validators




- [x] 8.1 Implement CreatePermohonanRequest with validation rules


  - Validate company_id exists and belongs to authenticated user (custom CompanyOwnershipRule)
  - Validate jenis_lesen_id is required integer
  - Validate butiran_operasi structure (alamat_premis, nama_perniagaan)
  - _Requirements: 1.1, 1.2, 4.1, 4.2, 4.3, 4.4_


- [x] 8.2 Implement UpdatePermohonanRequest with optional validation rules

  - Same rules as CreatePermohonanRequest but all fields optional
  - _Requirements: 6.1, 6.4_


- [x] 8.3 Implement UploadDokumenRequest with file validation rules

  - Validate keperluan_dokumen_id is required integer
  - Validate file is required, mimes (pdf,jpg,jpeg,png), and size in integer KB
  - _Requirements: 3.1, 3.2, 3.3_


- [x] 8.4 Create CompanyOwnershipRule custom validation rule

  - Verify company_id belongs to authenticated user
  - _Requirements: 1.2_
- [x] 9. Implement API controllers








- [ ] 9. Implement API controllers


- [x] 9.1 Create PermohonanController with index() method

  - Apply auth:sanctum, feature:MODULE_M02, and throttle:60,1 middleware
  - Get authenticated user
  - Apply filters: status, jenis_lesen_id, tarikh_dari, tarikh_hingga
  - Default sort by created_at DESC
  - Paginate results (default 15, max 100 per page)
  - Return JSON response
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 12.1, 12.2_


- [x] 9.2 Implement store() method in PermohonanController

  - Validate request via CreatePermohonanRequest
  - Delegate to PermohonanService.createDraft()
  - Return 201 with created resource
  - _Requirements: 1.1, 1.2, 1.3, 1.4_



- [x] 9.3 Implement show() method in PermohonanController




  - Authorize via PermohonanPolicy.view()
  - Eager load relationships (dokumen, company)
  - Return JSON response
  - _Requirements: 11.1, 11.2, 11.3, 11.4_


- [x] 9.4 Implement update() method in PermohonanController










- [ ] 9.4 Implement update() method in PermohonanController

  - Authorize via PermohonanPolicy.update()
  - Validate request via UpdatePermohonanRequest
  - Delegate to PermohonanService.updateDraft()
  - Return 200 with updated resource
  - _Requirements: 6.1, 6.2, 6.3, 6.4_



- [x] 9.5 Implement submit() method in PermohonanController





  - Authorize via PermohonanPolicy.submit()
  - Delegate to PermohonanService.submit()
  - Return 200 with success message
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_




- [x] 9.6 Implement cancel() method in PermohonanController




  - Authorize via PermohonanPolicy.cancel()
  - Validate reason in request
  - Delegate to PermohonanService.cancel()
  - Return 200 with success message

  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 10. Implement document upload controller














- [x] 10.1 Create DokumenController with store() method



  - Apply auth:sanctum, feature:MODULE_M02, and throttle:30,1 middleware
  - Authorize permohonan update via PermohonanPolicy.update()
  - Validate request via UploadDokumenRequest
  - Delegate to DokumenService.upload()
  - Return 201 with created resource
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.10_

- [x] 10.2 Implement destroy() method in DokumenController


  - Authorize permohonan update via PermohonanPolicy.update()
  - Verify dokumen belongs to permohonan
  - Delegate to DokumenService.delete()
  - Return 204
  - _Requirements: 6.1_

-



- [x] 11. Define API routes with feature flag middleware









- [x] 11.1 Register routes in routes/api.php with m02 prefix

  - POST /api/m02/permohonan (store)
  - GET /api/m02/permohonan (index)
  - GET /api/m02/permohonan/{id} (show)
  - PUT /api/m02/permohonan/{id} (update)
  - POST /api/m02/permohonan/{id}/submit (submit)
  - POST /api/m02/permohonan/{id}/cancel (cancel)
  - POST /api/m02/permohonan/{id}/dokumen (store document)
  - DELETE /api/m02/permohonan/{id}/dokumen/{dokumenId} (destroy document)
  - Apply feature:MODULE_M02 middleware to all routes
  - _Requirements: 12.1, 12.2_
-

-



-

- [x] 12. Implement event-driven integrations







- [x] 12.1 Create PermohonanDiserahkan event with permohonan payload

  - _Requirements: 8.3_


- [x] 12.2 Create ForwardToModule5Listener to handle PermohonanDiserahkan event

  - Forward application to Module 5 review queue
  - Implement exponential backoff retry (3 retries: 1s, 5s, 15s)
  - Log success and failure via AuditService
  - _Requirements: 8.4_


- [x] 12.3 Create SendSubmissionNotificationListener to handle PermohonanDiserahkan event

  - Trigger Module 12 to send email/SMS confirmation
  - Implement exponential backoff retry (3 retries: 1s, 5s, 15s)
  - Log success and failure via AuditService
  - _Requirements: 8.6_


- [x] 12.4 Create DokumenDimuatNaik event with permohonanDokumen payload

  - _Requirements: 3.7_


- [x] 12.5 Create QueueAntivirusScanListener to handle DokumenDimuatNaik event

  - Check if AV scanning is enabled via config
  - Queue AV scan job on configured queue with 5-minute timeout
  - Implement exponential backoff retry (3 retries)
  - Log success and failure via AuditService
  - _Requirements: 3.8_


- [x] 12.6 Register events and listeners in


 EventServiceProvider



  - _Requirements: 8.3, 8.4, 8.6, 3.7, 3.8_
-

- [x] 13. Create development seeders








- [x] 13.1 Implement JenisLesenSeeder for sample license types

  - Only run in non-production environments
  - Create 2-3 sample jenis_lesen records
  - _Requirements: 15.1, 15.3, 15.4_


- [x] 13.2 Implement KeperluanDokumenSeeder for sample document requirements

  - Only run in non-production environments
  - Create sample keperluan_dokumen records linked to sample jenis_lesen
  - _Requirements: 15.2, 15.3, 15.4_


-_qumnts: 15.5_




- [x] 13.3 Register seeders in DatabaseSeeder

  - _Requirements: 15.5_

- [x] 14. Configure environment and feature flags







- [x] 14.1 Add MODULE_M02 feature flag to .env.example

  - Set default to false
  - _Requirements: 12.1, 12.2, 12.3_


- [x] 14.2 Add file upload configuration to .env.example

  - FILESYSTEM_DISK, MAX_UPLOAD_SIZE, FILE_INTEGRITY_HASH_ENABLED
  - _Requirements: 3.1, 3.2, 3.5_



- [x] 14.3 Add Module 4 integration configuration to .env.example

  - MODULE_4_BASE_URL, MODULE_4_CACHE_TTL
  - _Requirements: 2.1, 2.2, 2.3_



- [x] 14.4 Add antivirus configuration to .env.example

  - AV_SCAN_ENABLED, AV_SCAN_QUEUE
  - _Requirements: 3.8_

- [x] 15. Write feature tests for application CRUD operations






- [x] 15.1 Test POST /api/m02/permohonan creates draft application






  - Verify pre-populated user and company data
  - Verify status is 'Draf'
  - Verify audit log entry
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]* 15.2 Test GET /api/m02/permohonan lists applications with filters
  - Test status filter
  - Test jenis_lesen_id filter
  - Test date range filter
  - Test pagination
  - Test default sort by created_at DESC
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ]* 15.3 Test GET /api/m02/permohonan/{id} returns application details
  - Verify ownership enforcement
  - Verify relationships loaded
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ]* 15.4 Test PUT /api/m02/permohonan/{id} updates draft application
  - Verify status must be 'Draf'
  - Verify ownership enforcement
  - Verify audit log entry
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 15.5 Test POST /api/m02/permohonan/{id}/submit submits application
  - Verify completeness validation
  - Verify status changes to 'Diserahkan'
  - Verify tarikh_serahan is set
  - Verify event is emitted
  - Verify identity verification requirement
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3_

- [ ]* 15.6 Test POST /api/m02/permohonan/{id}/cancel cancels draft application
  - Verify status must be 'Draf'
  - Verify status changes to 'Dibatalkan'
  - Verify record is retained
  - Verify audit log entry
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 16. Write feature tests for document upload operations






- [ ]* 16.1 Test POST /api/m02/permohonan/{id}/dokumen uploads document
  - Test file type validation (PDF, JPG, JPEG, PNG)
  - Test file size validation
  - Verify metadata stored correctly
  - Verify status_sah is 'BelumSah'
  - Verify event is emitted
  - Verify audit log entry
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.10_

- [ ]* 16.2 Test document replacement when uploading to same keperluan_dokumen_id
  - Verify old document is deleted
  - Verify new document is created
  - _Requirements: 3.6_

- [ ]* 16.3 Test DELETE /api/m02/permohonan/{id}/dokumen/{dokumenId} deletes document
  - Verify status must be 'Draf'
  - Verify cannot delete validated documents
  - Verify file is deleted from storage
  - Verify audit log entry
  - _Requirements: 6.1_

- [x] 17. Write feature tests for authorization







- [ ]* 17.1 Test ownership enforcement across all endpoints
  - Verify users cannot access other users' applications
  - _Requirements: 6.3, 11.1_

- [ ]* 17.2 Test status-based restrictions
  - Verify cannot update submitted applications
  - Verify cannot cancel submitted applications
  - Verify can view submitted applications
  - _Requirements: 6.1, 6.2, 9.1, 9.2_

- [ ]* 17.3 Test feature flag middleware
  - Verify endpoints return error when MODULE_M02 is disabled
  - _Requirements: 12.1, 12.2_

- [ ]* 17.4 Test identity verification requirement for submission
  - Verify unverified users cannot submit applications
  - _Requirements: 8.1_

- [ ]* 17.5 Test company ownership validation
  - Verify cannot create application with unowned company
  - Verify cannot update application to unowned company
  - _Requirements: 1.2_

- [x] 18. Write integration tests for Module 4 client






- [x]* 18.1 Test fetching jenis_lesen catalog with caching

  - Mock HTTP response
  - Verify cache behavior (15 minutes)
  - Test development fallback
  - _Requirements: 2.1, 2.3, 2.4_

- [x]* 18.2 Test fetching keperluan_dokumen with caching

  - Mock HTTP response
  - Verify cache behavior (15 minutes)
  - Test development fallback
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 19. Write integration tests for event-driven workflows





- [x]* 19.1 Test PermohonanDiserahkan event triggers Module 5 forwarding

  - Mock Module 5 API
  - Verify retry behavior on failure
  - Verify audit logging
  - _Requirements: 8.4_

- [x]* 19.2 Test PermohonanDiserahkan event triggers Module 12 notification

  - Mock Module 12 API
  - Verify retry behavior on failure
  - Verify audit logging
  - _Requirements: 8.6_

- [x]* 19.3 Test DokumenDimuatNaik event queues AV scan when enabled

  - Verify job is queued
  - Verify job is not queued when AV scanning disabled
  - _Requirements: 3.8_

- [x] 20. Write unit tests for service layer






- [ ]* 20.1 Test PermohonanService methods
  - Test createDraft() with pre-population
  - Test updateDraft() validation
  - Test validateCompleteness() logic
  - Test submit() workflow
  - Test cancel() workflow
  - _Requirements: 1.1, 1.2, 6.1, 7.1, 7.2, 7.3, 8.1, 9.1_

- [ ]* 20.2 Test DokumenService methods
  - Test upload() with file validation
  - Test hash computation when enabled
  - Test delete() restrictions
  - _Requirements: 3.1, 3.2, 3.5, 6.1_
