# Implementation Plan

- [X] 1. Set up project foundation and feature flags
  - Laravel Sanctum is already installed and configured
  - Basic project structure exists
  - User model exists but needs M01 fields
  - _Requirements: 8.1, 8.2, 8.3_
- [X] 1.1 Create feature flag system
  - FeatureFlagMiddleware class with module checking logic is implemented
  - Feature configuration exists in config/features.php
  - Middleware is registered in HTTP kernel
  - _Requirements: 8.1, 8.2, 8.3_
- [X] 1.2 Configure environment and feature flags
  - .env.example includes MODULE_M01 and other required variables
  - Feature flag defaults configured in config/features.php
  - Environment setup requirements documented
  - _Requirements: 8.1, 8.2, 8.3_
- [X] 1.3 Set up Module M01 directory structure
  - Create controllers, requests, resources, and services directories under app/Http
  - Set up namespace organization for M01 components
  - _Requirements: 8.1_

- [X] 2. Implement data models and database schema
  - Update existing users table and create new tables for companies and audit_logs
  - Implement Eloquent models with relationships and business logic
  - Set up model factories for testing
  - _Requirements: 1.2, 1.3, 4.2, 7.1, 7.2, 7.3, 7.4, 7.5_
- [X] 2.1 Create migration to add M01 fields to users table
  - Create migration to add ic_no, status_verified_person, role, and soft deletes to existing users table
  - Add unique constraints and indexes for email and ic_no
  - Set up enum for role field (PEMOHON, PENTADBIR_SYS)
  - _Requirements: 1.2, 1.3_
- [X] 2.2 Create companies table migration
  - Create migration with id, ssm_no, name, status, owner_user_id, timestamps
  - Add foreign key constraint for owner_user_id referencing users.id
  - Set up enum for status field (active, inactive, unknown)
  - _Requirements: 4.2_
- [X] 2.3 Create audit_logs table migration
  - Create migration with id, actor_id, action, entity_type, entity_id, meta, created_at
  - Add foreign key constraint for actor_id referencing users.id
  - Set up JSON column for meta field
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
- [X] 2.4 Update User model
  - Update existing User model to include M01 fields (ic_no, status_verified_person, role)
  - Define fillable fields, casts, and relationships
  - Add scopes for verified and active users
  - Add soft deletes functionality
  - _Requirements: 1.2, 1.3, 6.1, 6.2_
- [X] 2.5 Implement Company model
  - Create Company model with fillable fields and casts
  - Define relationship to User model (owner)
  - Add polymorphic relationship to audit logs
  - _Requirements: 4.2, 5.2_
- [X] 2.6 Implement AuditLog model
  - Create AuditLog model with fillable fields and casts
  - Define relationships to User (actor) and polymorphic entity
  - Set up JSON casting for meta field
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
- [X] 2.7 Update model factories
  - Update UserFactory with M01 fields and realistic test data generation
  - Create CompanyFactory with various status scenarios
  - Create AuditLogFactory for testing audit functionality
  - _Requirements: 9.4_

- [x] 3. Implement business logic services




  - Create service classes for authentication, identity verification, company management, and account lifecycle
  - Implement audit logging service for tracking all mutations
  - Create mock client adapters for external service integration
  - _Requirements: 1.1, 1.4, 1.5, 2.1, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5_
- [X] 3.1 Create AuditService
  - Implement centralized audit logging with log() and logUserAction() methods
  - Handle actor identification and metadata collection
  - Create audit log entries for all system mutations
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
- [X] 3.2 Create AuthService
  - Implement user registration with validation and audit logging
  - Implement user authentication with token generation
  - Integrate with AuditService for tracking auth events
  - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.3_
- [X] 3.3 Create MockIdentityClient
  - Implement identity verification with mock logic (IC ending with even digit = verified)
  - Return structured IdentityVerificationResult objects
  - Handle both success and failure scenarios
  - _Requirements: 3.1, 3.2, 3.3_
- [x] 3.4 Create IdentityVerificationService




  - Implement identity verification orchestration using MockIdentityClient
  - Update user verification status based on client response
  - Create audit log entries for verification attempts
  - _Requirements: 3.1, 3.2, 3.3_
- [x] 3.5 Create MockSSMClient and CompanyStatusResult




  - Implement SSM verification with mock logic (SSM starting with "SSM-" = active)
  - Return structured CompanyStatusResult objects
  - Handle various company status scenarios
  - _Requirements: 4.1, 4.2, 4.3_
- [x] 3.6 Create CompanyService




  - Implement SSM verification and company creation/update logic
  - Implement user-to-company linking with ownership validation
  - Integrate with MockSSMClient and AuditService
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_
- [x] 3.7 Create AccountService




  - Implement account deactivation with soft delete
  - Implement token revocation for deactivated users
  - Create audit log entries for account lifecycle events
  --_Requirements: 6.1, 6.2, 6.3_

- [x] 4. Create API controllers and request/response handling




  - Create API controllers for authentication, profile, company, and account management
  - Implement form request classes for input validation
  - Create API resource classes for consistent response formatting
  - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_
- [x] 4.1 Create form request classes


  - Create RegisterRequest with validation rules for name, email, password, ic_no
  - Create LoginRequest with email and password validation
  - Create VerifyIdentityRequest, VerifySSMRequest, LinkCompanyRequest
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_
- [x] 4.2 Create API resource classes


  - Create UserResource for consistent user data formatting
  - Create CompanyResource for company data formatting
  - Create AuditLogResource for audit trail responses
  - _Requirements: 1.5, 2.3, 4.3, 5.3_
- [x] 4.3 Create AuthController


  - Implement register() method with RegisterRequest validation
  - Implement login() method with LoginRequest validation
  - Return UserResource and authentication tokens
  - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.2, 2.3_
- [x] 4.4 Create ProfileController


  - Implement verifyIdentity() method with VerifyIdentityRequest validation
  - Integrate with IdentityVerificationService
  - Return verification status and updated user data
  - _Requirements: 3.1, 3.2, 3.3_
- [x] 4.5 Create CompanyController


  - Implement verifySSM() method with VerifySSMRequest validation
  - Implement linkCompany() method with LinkCompanyRequest validation
  - Integrate with CompanyService and authorization policies
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_
- [x] 4.6 Create AccountController


  - Implement deactivate() method for account soft deletion
  - Integrate with AccountService for token revocation
  - Return success confirmation
  - _Requirements: 6.1, 6.2, 6.3_
- [x] 5. Implement authorization and policies




  - Create authorization policies for company management and resource access
  - Implement role-based access control for PEMOHON and PENTADBIR_SYS roles
  - Set up policy registration and middleware integration
  - _Requirements: 5.1, 5.4_
- [x] 5.1 Create CompanyPolicy


  - Implement link() method to check company ownership permissions
  - Implement viewAny() method for admin-only company listing
  - Handle authorization for company-related operations
  - _Requirements: 5.1, 5.4_

- [x] 5.2 Register policies and gates

  - Register CompanyPolicy in AuthServiceProvider
  - Set up policy middleware for protected routes
  - Configure role-based authorization gates
  - _Requirements: 5.4_
- [x] 6. Set up API routes and middleware




  - Create API routes for all Module M01 endpoints
  - Apply authentication, feature flag, and rate limiting middleware
  - Organize routes with proper grouping and naming
  - _Requirements: 8.1, 8.2, 8.3_
- [x] 6.1 Create authentication routes


  - Set up POST /api/auth/register and /api/auth/login routes
  - Apply throttling middleware for security
  - Group routes logically with proper naming
  - _Requirements: 1.1, 2.1_
- [x] 6.2 Create protected API routes


  - Set up routes for profile, company, and account endpoints
  - Apply auth:sanctum and feature:MODULE_M01 middleware
  - Configure route model binding where appropriate
  - _Requirements: 3.1, 4.1, 5.1, 6.1, 8.1, 8.2, 8.3_
- [x] 7. Create database seeders for testing




  - Create seeders for admin users and sample companies
  - Set up realistic test data for development and testing
  - Implement seeder classes with proper data relationships
  - _Requirements: 9.4_
- [x] 7.1 Create UserSeeder


  - Create admin user with PENTADBIR_SYS role
  - Create sample PEMOHON users with various verification states
  - Set up realistic user data for testing scenarios
  - _Requirements: 9.4_
- [x] 7.2 Create CompanySeeder


  - Create sample companies with different SSM numbers and statuses
  - Link some companies to seeded users for testing
  - Set up various company scenarios (active, inactive, unknown)
  - _Requirements: 9.4_
- [x] 7.3 Register seeders in DatabaseSeeder


  - Call UserSeeder and CompanySeeder in proper order
  - Set up seeder execution for development environment
  - _Requirements: 9.4_
- [x] 8. Implement comprehensive testing




  - Configure Pest testing framework (already installed via Composer)
  - Create Pest feature tests for all API endpoints covering success and error scenarios
  - Create unit tests for service classes and mock clients
  - Implement contract tests for external service integrations
  - _Requirements: 9.1, 9.2, 9.3_
- [x] 8.1 Configure Pest testing framework


  - Create Pest.php configuration file
  - Set up test helpers and base test classes for Pest
  - Configure test environment settings
  - _Requirements: 9.1, 9.2, 9.3_
- [x] 8.2 Create authentication feature tests


  - Test user registration endpoint (200, 422 validation errors)
  - Test user login endpoint (200, 401 authentication errors)
  - Test audit log creation for auth events
  - _Requirements: 9.1_
- [x] 8.3 Create profile feature tests


  - Test identity verification endpoint (200, 422 validation errors)
  - Test verification status updates and audit logging
  - Test authentication requirements (401 errors)
  - _Requirements: 9.1_
- [x] 8.4 Create company feature tests


  - Test SSM verification endpoint (200, 422 validation errors)
  - Test company linking endpoint with authorization (200, 401, 403 errors)
  - Test audit log creation for company operations
  - _Requirements: 9.1_
- [x] 8.5 Create account feature tests


  - Test account deactivation endpoint (200, 401 errors)
  - Test soft delete functionality and token revocation
  - Test audit log creation for account lifecycle
  - _Requirements: 9.1_
- [x] 8.6 Create service unit tests


  - Test AuthService registration and login methods
  - Test IdentityVerificationService and CompanyService logic
  - Test AccountService deactivation and AuditService logging
  - _Requirements: 9.2_
- [x] 8.7 Create mock client contract tests


  - Test MockIdentityClient verification scenarios (success/failure)
  - Test MockSSMClient status check scenarios (active/inactive/unknown)
  - Test edge cases and error handling
  - _Requirements: 9.2, 9.3_
- [x] 8.8 Create feature flag tests



  - Test route accessibility when MODULE_M01=true
  - Test 404 responses when MODULE_M01=false
  - Test middleware behavior and configuration
  - _Requirements: 9.1_
- [x] 9. Final integration and system verification







  - Set up error handling and logging configuration
  - Verify complete system integration and functionality
  - _Requirements: 8.1, 8.2, 8.3_
- [x] 9.1 Configure error handling and logging




  - Set up custom exception handling for business logic errors
  - Configure audit log retention and cleanup policies
  - Set up proper error responses for API consistency
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
- [x] 9.2 Verify system integration





  - Run complete test suite to ensure all functionality works
  - Test end-to-end user flows (register → verify → link company → deactivate)
  - Verify audit logging for all operations
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3_
