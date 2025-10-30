# M02 Frontend Error Handling Implementation

## Overview

This document describes the comprehensive error handling implementation for the M02 License Application Management frontend module. All pages and components now use the centralized error handling infrastructure from M01.

## Error Handling Strategy

### 1. Centralized Error Handler (`useErrorHandler` hook)

All M02 pages and components use the `useErrorHandler` hook which provides:

- **handleError**: Enhances errors with user-friendly messages and categorization
- **handleValidationErrors**: Formats 422 validation errors for inline display
- **showErrorNotification**: Displays toast notifications for errors
- **executeWithErrorHandling**: Wraps async operations with error handling

### 2. Error Types Handled

#### 401 Unauthorized
- **Behavior**: Redirect to login page
- **Implementation**: Detected in error handler, triggers navigation to `/login`
- **User Experience**: Seamless redirect with preserved destination URL

#### 403 Forbidden
- **Behavior**: Show toast notification
- **Implementation**: Uses `showErrorNotification` to display "Tidak dibenarkan" message
- **User Experience**: Non-intrusive notification that dismisses automatically

#### 422 Validation Errors
- **Behavior**: Display inline field errors
- **Implementation**: 
  - Extract field-level errors from response
  - Map backend field names to form field names
  - Display errors below respective form fields
- **User Experience**: Clear indication of which fields need correction

#### Network Errors (Status 0)
- **Behavior**: Display global Alert component
- **Implementation**: Show user-friendly message about connection issues
- **User Experience**: Prominent error message with retry option

#### Server Errors (5xx)
- **Behavior**: Display global Alert component
- **Implementation**: Show generic server error message
- **User Experience**: Clear indication of server-side issues

## Implementation Details

### Pages Updated

#### 1. LicensesListPage
- **Location**: `resources/js/pages/licenses/LicensesListPage.tsx`
- **Error Handling**:
  - Fetch licenses: Handles all error types
  - 401: Redirects to login
  - 403: Shows toast notification
  - Network/Server: Displays Alert with retry button

#### 2. LicenseCreatePage
- **Location**: `resources/js/pages/licenses/LicenseCreatePage.tsx`
- **Error Handling**:
  - Fetch Jenis Lesen: Handles all error types
  - Save draft: Handles validation, auth, and network errors
  - 422: Shows validation error notification
  - 401: Redirects to login
  - 403: Shows toast notification

#### 3. LicenseEditPage
- **Location**: `resources/js/pages/licenses/LicenseEditPage.tsx`
- **Error Handling**:
  - Fetch license data: Handled by `useLicense` hook
  - Fetch Jenis Lesen: Handles all error types
  - Guard redirects: Automatic for non-draft applications

#### 4. LicenseDetailsPage
- **Location**: `resources/js/pages/licenses/LicenseDetailsPage.tsx`
- **Error Handling**:
  - Fetch license data: Handled by `useLicense` hook
  - Cancel application: Handles all error types
  - 401: Redirects to login
  - 403: Shows toast notification

### Components Updated

#### 1. MaklumatTab
- **Location**: `resources/js/pages/licenses/components/MaklumatTab.tsx`
- **Error Handling**:
  - Update license: Comprehensive error handling
  - 422: Maps backend field names to form fields, displays inline errors
  - 401: Redirects to login
  - 403: Shows toast notification
  - Network/Server: Shows notification

#### 2. DokumenTab
- **Location**: `resources/js/pages/licenses/components/DokumenTab.tsx`
- **Error Handling**:
  - Upload document: Handles all error types
  - Delete document: Handles all error types
  - 422: Shows validation error notification
  - 401: Redirects to login
  - 403: Shows toast notification

#### 3. SerahanTab
- **Location**: `resources/js/pages/licenses/components/SerahanTab.tsx`
- **Error Handling**:
  - Submit application: Comprehensive error handling
  - 422: Extracts and displays all validation errors in Alert
  - 401: Redirects to login
  - 403: Shows toast notification
  - Network/Server: Shows notification

### Custom Hooks Updated

#### 1. useLicense
- **Location**: `resources/js/hooks/useLicense.ts`
- **Error Handling**:
  - Fetch license: Uses `handleError` for all error types
  - Returns user-friendly error messages
  - Logs errors with context

#### 2. useLicenseRequirements
- **Location**: `resources/js/hooks/useLicenseRequirements.ts`
- **Error Handling**:
  - Fetch requirements: Uses `handleError` for all error types
  - Returns user-friendly error messages
  - Logs errors with context

## Error Context Logging

All error handlers include context information for debugging:

```typescript
const enhancedError = handleError(err as ApiError, {
  context: 'ComponentName.functionName',
  licenseId: id,
  // ... other relevant context
});
```

This provides detailed error logs in development while showing user-friendly messages to users.

## User Experience Patterns

### 1. Inline Validation Errors
- Displayed below form fields
- Cleared when user starts typing
- Specific to each field

### 2. Toast Notifications
- Used for 403 errors
- Auto-dismiss after 5 seconds
- Non-intrusive

### 3. Alert Components
- Used for network and server errors
- Prominent display
- Include retry options where applicable

### 4. Loading States
- Shown during async operations
- Prevent duplicate submissions
- Clear indication of progress

### 5. Error Recovery
- Retry buttons for network errors
- Clear navigation back to safe states
- Preserved form data where possible

## Testing Recommendations

### Manual Testing Scenarios

1. **401 Unauthorized**
   - Clear auth token
   - Attempt any API operation
   - Verify redirect to login

2. **403 Forbidden**
   - Use account without permissions
   - Attempt restricted operation
   - Verify toast notification

3. **422 Validation**
   - Submit form with invalid data
   - Verify inline field errors
   - Verify error clearing on input

4. **Network Error**
   - Disconnect network
   - Attempt API operation
   - Verify Alert with retry option

5. **Server Error**
   - Simulate 500 response
   - Verify user-friendly error message
   - Verify error logging

## Requirements Coverage

This implementation satisfies the following requirements from the design document:

- **Requirement 8.9**: Handle 422 validation errors with inline field errors ✓
- **Requirement 8.10**: Handle 403 authorization errors with toast notification ✓
- **Requirement 8.11**: Handle 401 authentication errors with redirect to login ✓
- **Requirement 8.12**: Handle network errors with global Alert component ✓
- **Requirement 10.1**: Display inline field errors for 422 validation errors ✓
- **Requirement 10.2**: Display toast message for 403 authorization errors ✓
- **Requirement 10.3**: Redirect to login for 401 authentication errors ✓
- **Requirement 10.4**: Display global Alert for network errors ✓
- **Requirement 10.5**: Reuse existing Alert, LoadingSpinner, and Toast components ✓

## Maintenance Notes

### Adding Error Handling to New Components

1. Import the error handler hook:
```typescript
import { useErrorHandler } from '../../hooks/useErrorHandler';
```

2. Use the hook in your component:
```typescript
const { handleError, showErrorNotification } = useErrorHandler();
```

3. Wrap API calls with error handling:
```typescript
try {
  await apiClient.someOperation();
} catch (err) {
  const enhancedError = handleError(err as ApiError, {
    context: 'ComponentName.functionName',
  });
  
  if (enhancedError.status === 401) {
    navigate('/login');
  } else if (enhancedError.status === 403) {
    showErrorNotification(enhancedError);
  } else if (enhancedError.status === 422) {
    // Handle validation errors
  } else {
    // Handle other errors
  }
}
```

### Consistency Guidelines

- Always use `handleError` for error processing
- Always include context in error handling
- Always handle 401, 403, and 422 explicitly
- Always provide user-friendly error messages
- Always log errors for debugging

## Related Files

- Error utilities: `resources/js/utils/errorHandler.ts`
- Error handler hook: `resources/js/hooks/useErrorHandler.ts`
- API client: `resources/js/services/apiClient.ts`
- Type definitions: `resources/js/types/index.ts`
