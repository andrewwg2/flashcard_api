# Centralized Error Messages System

This directory contains the centralized error messages configuration for the flashcard API. This system ensures that all error messages are managed in one place, making it easy to maintain consistency across the application and tests.

## Overview

The centralized error messages system provides:
- **Single source of truth** for all error messages
- **Consistent error codes** and status codes
- **Easy maintenance** - change a message once, it updates everywhere
- **Test integration** - tests use the same messages as production code
- **Type safety** with TypeScript interfaces
- **Message formatting** with dynamic parameter substitution

## Files

### `errorMessages.ts`
The main configuration file containing all error messages organized by category:
- Validation errors (400)
- Authentication/Authorization errors (401, 403)
- Not Found errors (404)
- Conflict errors (409)
- File Processing errors (422)
- Rate Limiting errors (429)
- Server errors (500)
- Success messages
- Console/Log messages

### `../tests/constants/testErrorMessages.ts`
Test-specific utilities that import and re-export the main error messages for use in tests.

## Usage

### Basic Usage

```typescript
import { ErrorMessages } from '../constants/errorMessages';

// Get a simple error message
const notFoundConfig = ErrorMessages.resourceNotFound();
throw new NotFoundError(notFoundConfig.message);

// Get an error message with parameters
const invalidIdConfig = ErrorMessages.invalidObjectId('userId', 'invalid-123');
throw new ValidationError(invalidIdConfig.message);
```

### In Error Classes

```typescript
import { ErrorMessages } from '../constants/errorMessages';

export class NotFoundError extends AppError {
  constructor(message?: string, details?: any) {
    const errorConfig = ErrorMessages.resourceNotFound();
    super(message || errorConfig.message, errorConfig.statusCode, details);
    this.name = 'NotFoundError';
  }
}
```

### In Controllers

```typescript
import { ErrorMessages } from '../constants/errorMessages';

export const uploadCSV = asyncHandler(async (req: Request, res: Response) => {
  try {
    await flashcardService.processCSVUpload(csvFilePath);
    
    const successConfig = ErrorMessages.csvProcessed();
    res.status(successConfig.statusCode).json({
      success: true,
      message: successConfig.message,
      filePath: csvFilePath
    });
  } catch (error: any) {
    const errorConfig = ErrorMessages.csvProcessingFailed(error.message);
    throw new FileProcessingError(errorConfig.message);
  }
});
```

### In Tests

```typescript
import { TestErrorMessages, TestAssertions } from '../constants/testErrorMessages';

describe('API Tests', () => {
  it('should return validation error', async () => {
    const res = await request(app).post('/api/flashcards/add').send({});
    
    // Use centralized test assertions
    TestAssertions.assertValidationError(res, 'englishWord');
  });

  it('should return not found error', async () => {
    const res = await request(app).get('/api/flashcards/practice/NonExistent');
    
    const expected = TestErrorMessages.expectNoFlashcardsNeedPractice('NonExistent');
    expect(res.statusCode).toBe(expected.statusCode);
    expect(res.body.message).toBe(expected.message);
  });
});
```

## Error Message Structure

Each error message has the following structure:

```typescript
interface ErrorMessageConfig {
  code: string;        // Unique error code (e.g., 'VALIDATION_001')
  message: string;     // The error message (may contain placeholders)
  statusCode: number;  // HTTP status code
}
```

## Message Categories

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

### Rate Limiting (429)
- `RATE_001`: Too many requests

### Server Errors (500)
- `SERVER_001`: Internal server error
- `SERVER_002`: Database operation failed
- `SERVER_003`: MongoDB connection error
- `SERVER_004`: Server startup failed
- `SERVER_005`: Uncaught exception
- `SERVER_006`: Unhandled rejection

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

## Utility Functions

### `formatErrorMessage(template, params)`
Formats a message template with dynamic parameters.

### `getErrorMessage(path)`
Gets an error message configuration by dot notation path.

### `createErrorMessage(path, params)`
Creates a formatted error message with parameters.

## Best Practices

1. **Always use centralized messages**: Don't hardcode error messages in your code.

2. **Use appropriate error codes**: Each error should have a unique code for tracking.

3. **Provide context**: Include relevant details in error responses.

4. **Test with real messages**: Use the same error messages in tests as in production.

5. **Keep messages user-friendly**: Write clear, actionable error messages.

6. **Use consistent formatting**: Follow the established patterns for new messages.

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

## Migration Guide

If you're migrating from hardcoded error messages:

1. **Identify all hardcoded messages** in your codebase
2. **Add them to the centralized configuration** with appropriate codes
3. **Replace hardcoded messages** with calls to the centralized system
4. **Update tests** to use the centralized messages
5. **Test thoroughly** to ensure all messages work correctly

## Limitations

- Maximum of 100 error messages (as requested)
- Message templates use simple `{placeholder}` syntax
- Error codes should be unique within each category

## Support

For questions or issues with the error messages system, please refer to the main project documentation or create an issue in the project repository.
