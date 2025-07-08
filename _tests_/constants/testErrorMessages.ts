/**
 * Test Error Messages Configuration
 * 
 * This file imports and re-exports the centralized error messages for use in tests.
 * This ensures that tests use the same error messages as the production code.
 */

import { 
  ERROR_MESSAGES, 
  ErrorMessages, 
  ConsoleMessages, 
  formatErrorMessage,
  createErrorMessage,
  getErrorMessage,
  ErrorMessageConfig
} from '../../src/constants/errorMessages';

// Re-export everything for tests
export {
  ERROR_MESSAGES,
  ErrorMessages,
  ConsoleMessages,
  formatErrorMessage,
  createErrorMessage,
  getErrorMessage,
  ErrorMessageConfig
};

// Test-specific error message helpers
export const TestErrorMessages = {
  // Common test error messages
  expectValidationError: (expectedField?: string) => {
    const config = ErrorMessages.requestValidationFailed();
    return {
      statusCode: config.statusCode,
      message: config.message,
      expectedField
    };
  },

  expectNotFoundError: (resourceName?: string) => {
    const config = resourceName 
      ? ErrorMessages.genericResourceNotFound(resourceName)
      : ErrorMessages.resourceNotFound();
    return {
      statusCode: config.statusCode,
      message: config.message
    };
  },

  expectServerError: () => {
    const config = ErrorMessages.internalServerError();
    return {
      statusCode: config.statusCode,
      message: config.message
    };
  },

  expectBadRequest: () => {
    const config = ErrorMessages.invalidObjectId('id', 'invalid-value');
    return {
      statusCode: config.statusCode,
      // Return base status code for generic bad request
      baseStatusCode: 400
    };
  },

  expectFlashcardNotFound: () => {
    const config = ErrorMessages.flashcardNotFound();
    return {
      statusCode: config.statusCode,
      message: config.message
    };
  },

  expectNoFlashcardsNeedPractice: (category: string) => {
    const config = ErrorMessages.noFlashcardsNeedPractice(category);
    return {
      statusCode: config.statusCode,
      message: config.message
    };
  },

  expectCsvProcessed: () => {
    const config = ErrorMessages.csvProcessed();
    return {
      statusCode: config.statusCode,
      message: config.message
    };
  }
};

// Test assertion helpers that use centralized messages
export const TestAssertions = {
  assertValidationError: (response: any, expectedField?: string) => {
    const expected = TestErrorMessages.expectValidationError(expectedField);
    expect(response.statusCode).toBe(expected.statusCode);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(typeof response.body.message).toBe('string');
    
    if (expectedField) {
      expect(response.body.message.toLowerCase()).toContain('required');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
    }
  },

  assertNotFoundError: (response: any, resourceName?: string) => {
    const expected = TestErrorMessages.expectNotFoundError(resourceName);
    expect(response.statusCode).toBe(expected.statusCode);
    expect(response.body).toHaveProperty('message');
    
    if (resourceName) {
      expect(response.body.message).toContain(resourceName);
    }
  },

  assertServerError: (response: any) => {
    const expected = TestErrorMessages.expectServerError();
    expect(response.statusCode).toBe(expected.statusCode);
    expect(response.body).toHaveProperty('message', expected.message);
  },

  assertBadRequest: (response: any) => {
    const expected = TestErrorMessages.expectBadRequest();
    expect(response.statusCode).toBe(expected.baseStatusCode);
    expect(response.body).toHaveProperty('message');
  },

  assertFlashcardCreated: (response: any, expectedData: any) => {
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    
    if (expectedData.spanishWord) {
      expect(response.body).toHaveProperty('spanishWord', expectedData.spanishWord);
    }
    if (expectedData.englishWord) {
      expect(response.body).toHaveProperty('englishWord', expectedData.englishWord);
    }
    if (expectedData.category) {
      expect(response.body).toHaveProperty('category', expectedData.category);
    }
  }
};

export default TestErrorMessages;
