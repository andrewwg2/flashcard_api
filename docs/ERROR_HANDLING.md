# Error Handling System

The Flashcard API features a comprehensive centralized error handling system that ensures consistent error messages, codes, and responses throughout the application.

## Overview

The centralized error messages system provides:
- **Single source of truth** for all error messages
- **Consistent error codes** and status codes
- **Easy maintenance** - change a message once, it updates everywhere
- **Test integration** - tests use the same messages as production code
- **Type safety** with TypeScript interfaces
- **Message formatting** with dynamic parameter substitution

## System Architecture

### Core Components

1. **Error Messages Configuration** (`src/constants/errorMessages.ts`)
   - 73 unique error messages organized by category
   - Consistent error codes with prefixes (VALIDATION_001, AUTH_001, etc.)
   - Dynamic message formatting with placeholder substitution
   - Type-safe interfaces for error message configuration

2. **Error Handler Middleware** (`src/middleware/errorHandler.ts`)
   - Centralized error processing
   - Consistent error response formatting
   - HTTP status code management
   - Error logging and tracking

3. **Test Integration** (`_tests_/constants/testErrorMessages.ts`)
   - Re-exports all production error messages for tests
   - Test-specific helper functions and assertions
   - Ensures tests use the same messages as production code

## Error Categories

### Validation Errors (400)
- `VALIDATION_001`: Required field missing
- `VALIDATION_002`: Invalid page number
- `VALIDATION_003`: Invalid limit
- `VALIDATION_004`: Invalid boolean value
- `VALIDATION_005`: Request validation failed
- `VALIDATION_006`: General validation failed
- `VALIDATION_007`: Invalid Object ID
- `VALIDATION_008`: File upload error

### Authentication/Authorization (401, 403)
- `AUTH_001`: Unauthorized access
- `AUTH_002`: Invalid token
- `AUTH_003`: Token expired
- `AUTH_004`: Access forbidden

### Not Found Errors (404)
- `NOT_FOUND_001`: Generic resource not found
- `NOT_FOUND_002`: Flashcard not found
- `NOT_FOUND_003`: Route not found
- `NOT_FOUND_004`: No flashcards need practice
- `NOT_FOUND_005`: Generic resource not found with name

### Conflict Errors (409)
- `CONFLICT_001`: Resource conflict
- `CONFLICT_002`: Duplicate field value
- `CONFLICT_003`: Duplicate resource

### File Processing Errors (422)
- `FILE_001`: File processing failed
- `FILE_002`: CSV file required
- `FILE_003`: Invalid CSV file
- `FILE_004`: CSV processing failed
- `FILE_005`: CSV file not found
- `FILE_006`: CSV read error
- `FILE_007`: CSV DB operations failed

### Server Errors (500)
- `SERVER_001`: Internal server error
- `SERVER_002`: Database operation failed
- `SERVER_003`: MongoDB connection error
- `SERVER_004`: Server startup failed
- `SERVER_005`: Uncaught exception
- `SERVER_006`: Unhandled rejection

## Usage Examples

### In Controllers
```typescript
import { ErrorMessages } from '../constants/errorMessages';

// Simple error
const errorConfig = ErrorMessages.flashcardNotFound();
throw new NotFoundError(errorConfig.message);

// Error with parameters
const errorConfig = ErrorMessages.noFlashcardsNeedPractice(category);
throw new NotFoundError(errorConfig.message);
```

### In Tests
```typescript
import { TestErrorMessages, TestAssertions } from '../constants/testErrorMessages';

// Use centralized test assertions
TestAssertions.assertValidationError(response, 'englishWord');

// Check specific error messages
const expected = TestErrorMessages.expectNoFlashcardsNeedPractice('Verbs');
expect(response.body.message).toBe(expected.message);
```

## Dynamic Message Formatting

Messages can contain placeholders that are replaced with actual values:

```typescript
// Message template: "Invalid {field}: {value}"
const errorConfig = ErrorMessages.invalidObjectId('userId', '123invalid');
// Result: "Invalid userId: 123invalid"

// Using formatErrorMessage directly
const formatted = formatErrorMessage(
  "No flashcards found in category '{category}' that need practice",
  { category: 'Verbs' }
);
// Result: "No flashcards found in category 'Verbs' that need practice"
```

## Error Response Format

All API errors follow a consistent response format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_001",
    "message": "englishWord is required",
    "statusCode": 400,
    "details": {
      "field": "englishWord",
      "value": null
    }
  },
  "timestamp": "2025-01-10T21:30:00.000Z"
}
```

## Benefits

### ✅ Centralized Management
- All error messages in one file
- Easy to find and update any message
- Consistent formatting and structure

### ✅ Test Consistency  
- Tests use the same messages as production
- No more test failures due to message changes
- Centralized test assertions

### ✅ Developer Experience
- Type-safe error message access
- IntelliSense support for all error messages
- Clear documentation and examples

### ✅ Maintainability
- Change a message once, updates everywhere
- Unique error codes for tracking and debugging
- Organized by logical categories

### ✅ Scalability
- Easy to add new error messages
- Supports up to 100 error messages (currently using 73)
- Extensible structure for future needs

## Adding New Error Messages

1. Add the new error message to the appropriate category in `errorMessages.ts`:

```typescript
VALIDATION: {
  // ... existing messages
  NEW_VALIDATION_ERROR: {
    code: 'VALIDATION_009',
    message: 'Your new validation error message',
    statusCode: 400
  }
}
```

2. Add a convenience method to the `ErrorMessages` object:

```typescript
export const ErrorMessages = {
  // ... existing methods
  newValidationError: () => ERROR_MESSAGES.VALIDATION.NEW_VALIDATION_ERROR,
};
```

3. Update tests to use the new error message:

```typescript
const errorConfig = ErrorMessages.newValidationError();
expect(response.body.message).toBe(errorConfig.message);
```

## Best Practices

1. **Always use centralized messages**: Don't hardcode error messages in your code
2. **Use appropriate error codes**: Each error should have a unique code for tracking
3. **Provide context**: Include relevant details in error responses
4. **Test with real messages**: Use the same error messages in tests as in production
5. **Keep messages user-friendly**: Write clear, actionable error descriptions
6. **Use consistent formatting**: Follow the established patterns for new messages

## Migration Guide

If you're migrating from hardcoded error messages:

1. **Identify all hardcoded messages** in your codebase
2. **Add them to the centralized configuration** with appropriate codes
3. **Replace hardcoded messages** with calls to the centralized system
4. **Update tests** to use the centralized messages
5. **Test thoroughly** to ensure all messages work correctly

For more detailed information, see the [centralized error messages documentation](../src/constants/README.md).
