# Requirements Document

## Introduction

This document outlines the requirements for Module M01: Profil Pelanggan (Pendaftaran & Pembatalan) of the OSC Pelesenan PBT Laravel application. This module provides user registration, identity verification, company verification, account linking, and account deactivation functionality with comprehensive audit logging.

## Glossary

- **OSC_System**: The OSC Pelesenan PBT Laravel application system
- **User**: A registered individual in the system with roles PEMOHON or PENTADBIR_SYS
- **Company**: A business entity registered with SSM (Suruhanjaya Syarikat Malaysia)
- **Identity_Verification**: Process of validating user identity through mock KPKT Hub/JPN/MyDigital adapters
- **SSM_Verification**: Process of validating company status through mock SSM adapter
- **Audit_Log**: Record of all system mutations for compliance and tracking
- **Feature_Flag**: Environment configuration to enable/disable module functionality
- **Mock_Adapter**: Simulated external service integration for testing purposes

## Requirements

### Requirement 1

**User Story:** As a new user, I want to register an account with my personal details, so that I can access the OSC Pelesenan system.

#### Acceptance Criteria

1. WHEN a user submits registration data, THE OSC_System SHALL validate name, email, password, and IC number fields
2. THE OSC_System SHALL create a new user record with status_verified_person set to false
3. THE OSC_System SHALL assign PEMOHON role by default to new users
4. THE OSC_System SHALL create an audit log entry for the registration action
5. THE OSC_System SHALL return authentication token upon successful registration

### Requirement 2

**User Story:** As a registered user, I want to authenticate with my credentials, so that I can access protected system features.

#### Acceptance Criteria

1. WHEN a user submits valid email and password, THE OSC_System SHALL authenticate the user
2. THE OSC_System SHALL generate and return a Sanctum authentication token
3. THE OSC_System SHALL create an audit log entry for the login action
4. IF authentication fails, THEN THE OSC_System SHALL return appropriate error response

### Requirement 3

**User Story:** As a registered user, I want to verify my identity, so that I can access identity-dependent features.

#### Acceptance Criteria

1. WHEN a user requests identity verification with IC number, THE OSC_System SHALL call Mock_Identity_Client
2. THE OSC_System SHALL update status_verified_person field based on verification result
3. THE OSC_System SHALL create an audit log entry for the verification attempt
4. THE OSC_System SHALL return verification status to the user

### Requirement 4

**User Story:** As a user, I want to verify company information, so that I can link my account to a legitimate business entity.

#### Acceptance Criteria

1. WHEN a user submits SSM number for verification, THE OSC_System SHALL call Mock_SSM_Client
2. THE OSC_System SHALL create or update company record with verification status
3. THE OSC_System SHALL set company status to active, inactive, or unknown based on verification
4. THE OSC_System SHALL create an audit log entry for the company verification action

### Requirement 5

**User Story:** As a verified user, I want to link my account to a company, so that I can represent that business in the system.

#### Acceptance Criteria

1. WHEN a user requests to link to a company, THE OSC_System SHALL verify user ownership permissions
2. THE OSC_System SHALL set the company owner_user_id to the authenticated user
3. THE OSC_System SHALL create an audit log entry for the company linking action
4. WHERE user has PENTADBIR_SYS role, THE OSC_System SHALL allow viewing all companies

### Requirement 6

**User Story:** As a user, I want to deactivate my account, so that I can remove my access while maintaining audit trail.

#### Acceptance Criteria

1. WHEN a user requests account deactivation, THE OSC_System SHALL perform soft delete on user record
2. THE OSC_System SHALL revoke all active Sanctum tokens for the user
3. THE OSC_System SHALL create an audit log entry for the deactivation action
4. THE OSC_System SHALL prevent further authentication for deactivated users

### Requirement 7

**User Story:** As a system administrator, I want comprehensive audit logging, so that I can track all system mutations for compliance.

#### Acceptance Criteria

1. THE OSC_System SHALL create audit log entries for all user registration actions
2. THE OSC_System SHALL create audit log entries for all authentication attempts
3. THE OSC_System SHALL create audit log entries for all identity verification attempts
4. THE OSC_System SHALL create audit log entries for all company verification and linking actions
5. THE OSC_System SHALL create audit log entries for all account deactivation actions

### Requirement 8

**User Story:** As a system administrator, I want feature flag control, so that I can enable or disable Module M01 functionality.

#### Acceptance Criteria

1. WHERE MODULE_M01 environment variable is true, THE OSC_System SHALL enable all M01 routes and controllers
2. WHERE MODULE_M01 environment variable is false, THE OSC_System SHALL return 404 for all M01 routes
3. THE OSC_System SHALL check feature flag before processing any M01 requests

### Requirement 9

**User Story:** As a developer, I want comprehensive test coverage, so that I can ensure system reliability and correctness.

#### Acceptance Criteria

1. THE OSC_System SHALL include Pest tests for all API endpoints covering 200, 401, and 422 response codes
2. THE OSC_System SHALL include contract tests for Mock_Identity_Client and Mock_SSM_Client
3. THE OSC_System SHALL include tests for both successful and failure scenarios
4. THE OSC_System SHALL include seeder data for testing admin users and sample companies