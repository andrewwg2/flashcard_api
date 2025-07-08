/**
 * Centralized Error Messages Configuration
 * 
 * This file contains all error messages used throughout the application.
 * To change an error message, simply update it here and it will be reflected
 * everywhere it's used, including in tests.
 * 
 * Maximum: 100 error messages as requested
 */

export interface ErrorMessageConfig {
  code: string;
  message: string;
  statusCode: number;
}

// Error message categories
export const ERROR_MESSAGES = {
  // Validation Errors (400)
  VALIDATION: {
    REQUIRED_FIELD_MISSING: {
      code: 'VALIDATION_001',
      message: 'Required field is missing',
      statusCode: 400
    },
    INVALID_PAGE_NUMBER: {
      code: 'VALIDATION_002', 
      message: 'Invalid page number',
      statusCode: 400
    },
    INVALID_LIMIT: {
      code: 'VALIDATION_003',
      message: 'Invalid limit (must be between 1 and 100)',
      statusCode: 400
    },
    INVALID_BOOLEAN: {
      code: 'VALIDATION_004',
      message: 'isCorrect must be a boolean value',
      statusCode: 400
    },
    REQUEST_VALIDATION_FAILED: {
      code: 'VALIDATION_005',
      message: 'Request validation failed',
      statusCode: 400
    },
    VALIDATION_FAILED: {
      code: 'VALIDATION_006',
      message: 'Validation failed',
      statusCode: 400
    },
    INVALID_OBJECT_ID: {
      code: 'VALIDATION_007',
      message: 'Invalid {field}: {value}',
      statusCode: 400
    },
    FILE_UPLOAD_ERROR: {
      code: 'VALIDATION_008',
      message: 'File upload error: {details}',
      statusCode: 400
    }
  },

  // Authentication/Authorization Errors (401, 403)
  AUTH: {
    UNAUTHORIZED_ACCESS: {
      code: 'AUTH_001',
      message: 'Unauthorized access',
      statusCode: 401
    },
    INVALID_TOKEN: {
      code: 'AUTH_002',
      message: 'Invalid token',
      statusCode: 401
    },
    TOKEN_EXPIRED: {
      code: 'AUTH_003',
      message: 'Token expired',
      statusCode: 401
    },
    ACCESS_FORBIDDEN: {
      code: 'AUTH_004',
      message: 'Access forbidden',
      statusCode: 403
    }
  },

  // Not Found Errors (404)
  NOT_FOUND: {
    RESOURCE_NOT_FOUND: {
      code: 'NOT_FOUND_001',
      message: 'Resource not found',
      statusCode: 404
    },
    FLASHCARD_NOT_FOUND: {
      code: 'NOT_FOUND_002',
      message: 'Flashcard not found',
      statusCode: 404
    },
    ROUTE_NOT_FOUND: {
      code: 'NOT_FOUND_003',
      message: 'The requested resource \'{url}\' was not found on this server.',
      statusCode: 404
    },
    NO_FLASHCARDS_NEED_PRACTICE: {
      code: 'NOT_FOUND_004',
      message: 'No flashcards found in category \'{category}\' that need practice',
      statusCode: 404
    },
    GENERIC_RESOURCE_NOT_FOUND: {
      code: 'NOT_FOUND_005',
      message: '{resourceName} not found',
      statusCode: 404
    }
  },

  // Conflict Errors (409)
  CONFLICT: {
    RESOURCE_CONFLICT: {
      code: 'CONFLICT_001',
      message: 'Resource conflict',
      statusCode: 409
    },
    DUPLICATE_FIELD_VALUE: {
      code: 'CONFLICT_002',
      message: 'Duplicate value for field \'{field}\': {value}',
      statusCode: 409
    },
    DUPLICATE_RESOURCE: {
      code: 'CONFLICT_003',
      message: '{message}',
      statusCode: 409
    }
  },

  // File Processing Errors (422)
  FILE_PROCESSING: {
    FILE_PROCESSING_FAILED: {
      code: 'FILE_001',
      message: 'File processing failed',
      statusCode: 422
    },
    CSV_FILE_REQUIRED: {
      code: 'FILE_002',
      message: 'CSV file path is required',
      statusCode: 422
    },
    INVALID_CSV_FILE: {
      code: 'FILE_003',
      message: 'File must be a CSV file',
      statusCode: 422
    },
    CSV_PROCESSING_FAILED: {
      code: 'FILE_004',
      message: 'Failed to process CSV file: {details}',
      statusCode: 422
    },
    CSV_FILE_NOT_FOUND: {
      code: 'FILE_005',
      message: 'CSV file does not exist at path: {filePath}',
      statusCode: 422
    },
    CSV_READ_ERROR: {
      code: 'FILE_006',
      message: 'Unable to open CSV file. Make sure the path is correct.',
      statusCode: 422
    },
    CSV_DB_OPERATIONS_FAILED: {
      code: 'FILE_007',
      message: 'CSV processing failed during DB operations.',
      statusCode: 422
    }
  },

  // Rate Limiting Errors (429)
  RATE_LIMIT: {
    TOO_MANY_REQUESTS: {
      code: 'RATE_001',
      message: 'Too many requests',
      statusCode: 429
    }
  },

  // Server Errors (500)
  SERVER: {
    INTERNAL_SERVER_ERROR: {
      code: 'SERVER_001',
      message: 'Internal server error',
      statusCode: 500
    },
    DATABASE_OPERATION_FAILED: {
      code: 'SERVER_002',
      message: 'Database operation failed',
      statusCode: 500
    },
    MONGODB_CONNECTION_ERROR: {
      code: 'SERVER_003',
      message: 'MongoDB connection error',
      statusCode: 500
    },
    SERVER_STARTUP_FAILED: {
      code: 'SERVER_004',
      message: 'Failed to start server',
      statusCode: 500
    },
    UNCAUGHT_EXCEPTION: {
      code: 'SERVER_005',
      message: 'UNCAUGHT EXCEPTION! 💥 Shutting down...',
      statusCode: 500
    },
    UNHANDLED_REJECTION: {
      code: 'SERVER_006',
      message: 'UNHANDLED REJECTION! 💥 Shutting down...',
      statusCode: 500
    }
  },

  // Success Messages (for consistency)
  SUCCESS: {
    CSV_PROCESSED: {
      code: 'SUCCESS_001',
      message: 'CSV file processed successfully',
      statusCode: 200
    },
    FLASHCARD_CREATED: {
      code: 'SUCCESS_002',
      message: 'Flashcard created successfully',
      statusCode: 201
    },
    FLASHCARD_UPDATED: {
      code: 'SUCCESS_003',
      message: 'Flashcard updated successfully',
      statusCode: 200
    },
    HEALTH_CHECK: {
      code: 'SUCCESS_004',
      message: 'Service is healthy',
      statusCode: 200
    },
    MAINTENANCE_TASK_COMPLETED: {
      code: 'SUCCESS_005',
      message: 'Maintenance task completed successfully',
      statusCode: 200
    }
  },

  // Console/Log Messages
  CONSOLE: {
    MONGODB_CONNECTED: 'MongoDB connected successfully',
    MONGODB_DISCONNECTED: 'MongoDB disconnected',
    MONGODB_RECONNECTED: 'MongoDB reconnected',
    MONGODB_ERROR: 'MongoDB error',
    SERVER_RUNNING: 'Server running on port {port}',
    ENVIRONMENT: 'Environment: {environment}',
    SIGTERM_RECEIVED: 'SIGTERM RECEIVED. Shutting down gracefully...',
    SIGINT_RECEIVED: 'SIGINT RECEIVED. Shutting down gracefully...',
    MONGODB_CONNECTION_CLOSED: 'MongoDB connection closed.',
    FLASHCARDS_LOADED_FROM_CSV: '{count} flashcards loaded from CSV',
    STREAM_ERROR: 'Stream error (file read issue)',
    FLASHCARD_DB_INSERT_ERROR: 'Flashcard DB insert error',
    INVALID_ROW_WARNING: 'Invalid row (missing fields)',
    UNEXPECTED_ROW_ERROR: 'Unexpected row error',
    ERROR_COMPLETING_DB_OPERATIONS: 'Error completing database operations',
    CLOSING_MONGODB_CONNECTION_ERROR: 'Error closing MongoDB connection'
  }
} as const;

/**
 * Utility function to format error messages with dynamic values
 * @param messageTemplate - The message template with placeholders
 * @param params - Object containing values to replace placeholders
 * @returns Formatted message string
 */
export function formatErrorMessage(messageTemplate: string, params: Record<string, any> = {}): string {
  let formattedMessage = messageTemplate;
  
  Object.entries(params).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    formattedMessage = formattedMessage.replace(new RegExp(placeholder, 'g'), String(value));
  });
  
  return formattedMessage;
}

/**
 * Get error message configuration by path
 * @param path - Dot notation path to the error message (e.g., 'VALIDATION.REQUIRED_FIELD_MISSING')
 * @returns Error message configuration
 */
export function getErrorMessage(path: string): ErrorMessageConfig {
  const pathParts = path.split('.');
  let current: any = ERROR_MESSAGES;
  
  for (const part of pathParts) {
    if (current[part]) {
      current = current[part];
    } else {
      // Return a default error if path not found
      return ERROR_MESSAGES.SERVER.INTERNAL_SERVER_ERROR;
    }
  }
  
  return current as ErrorMessageConfig;
}

/**
 * Create a formatted error message with parameters
 * @param path - Dot notation path to the error message
 * @param params - Parameters to substitute in the message
 * @returns Formatted error message configuration
 */
export function createErrorMessage(path: string, params: Record<string, any> = {}): ErrorMessageConfig {
  const errorConfig = getErrorMessage(path);
  
  return {
    ...errorConfig,
    message: formatErrorMessage(errorConfig.message, params)
  };
}

// Export commonly used error message getters for convenience
export const ErrorMessages = {
  // Validation
  requiredFieldMissing: () => ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_MISSING,
  invalidPageNumber: () => ERROR_MESSAGES.VALIDATION.INVALID_PAGE_NUMBER,
  invalidLimit: () => ERROR_MESSAGES.VALIDATION.INVALID_LIMIT,
  invalidBoolean: () => ERROR_MESSAGES.VALIDATION.INVALID_BOOLEAN,
  requestValidationFailed: () => ERROR_MESSAGES.VALIDATION.REQUEST_VALIDATION_FAILED,
  validationFailed: () => ERROR_MESSAGES.VALIDATION.VALIDATION_FAILED,
  invalidObjectId: (field: string, value: any) => createErrorMessage('VALIDATION.INVALID_OBJECT_ID', { field, value }),
  fileUploadError: (details: string) => createErrorMessage('VALIDATION.FILE_UPLOAD_ERROR', { details }),

  // Auth
  unauthorizedAccess: () => ERROR_MESSAGES.AUTH.UNAUTHORIZED_ACCESS,
  invalidToken: () => ERROR_MESSAGES.AUTH.INVALID_TOKEN,
  tokenExpired: () => ERROR_MESSAGES.AUTH.TOKEN_EXPIRED,
  accessForbidden: () => ERROR_MESSAGES.AUTH.ACCESS_FORBIDDEN,

  // Not Found
  resourceNotFound: () => ERROR_MESSAGES.NOT_FOUND.RESOURCE_NOT_FOUND,
  flashcardNotFound: () => ERROR_MESSAGES.NOT_FOUND.FLASHCARD_NOT_FOUND,
  routeNotFound: (url: string) => createErrorMessage('NOT_FOUND.ROUTE_NOT_FOUND', { url }),
  noFlashcardsNeedPractice: (category: string) => createErrorMessage('NOT_FOUND.NO_FLASHCARDS_NEED_PRACTICE', { category }),
  genericResourceNotFound: (resourceName: string) => createErrorMessage('NOT_FOUND.GENERIC_RESOURCE_NOT_FOUND', { resourceName }),

  // Conflict
  resourceConflict: () => ERROR_MESSAGES.CONFLICT.RESOURCE_CONFLICT,
  duplicateFieldValue: (field: string, value: any) => createErrorMessage('CONFLICT.DUPLICATE_FIELD_VALUE', { field, value }),
  duplicateResource: (message: string) => createErrorMessage('CONFLICT.DUPLICATE_RESOURCE', { message }),

  // File Processing
  fileProcessingFailed: () => ERROR_MESSAGES.FILE_PROCESSING.FILE_PROCESSING_FAILED,
  csvFileRequired: () => ERROR_MESSAGES.FILE_PROCESSING.CSV_FILE_REQUIRED,
  invalidCsvFile: () => ERROR_MESSAGES.FILE_PROCESSING.INVALID_CSV_FILE,
  csvProcessingFailed: (details: string) => createErrorMessage('FILE_PROCESSING.CSV_PROCESSING_FAILED', { details }),
  csvFileNotFound: (filePath: string) => createErrorMessage('FILE_PROCESSING.CSV_FILE_NOT_FOUND', { filePath }),
  csvReadError: () => ERROR_MESSAGES.FILE_PROCESSING.CSV_READ_ERROR,
  csvDbOperationsFailed: () => ERROR_MESSAGES.FILE_PROCESSING.CSV_DB_OPERATIONS_FAILED,

  // Rate Limit
  tooManyRequests: () => ERROR_MESSAGES.RATE_LIMIT.TOO_MANY_REQUESTS,

  // Server
  internalServerError: () => ERROR_MESSAGES.SERVER.INTERNAL_SERVER_ERROR,
  databaseOperationFailed: () => ERROR_MESSAGES.SERVER.DATABASE_OPERATION_FAILED,
  mongodbConnectionError: () => ERROR_MESSAGES.SERVER.MONGODB_CONNECTION_ERROR,
  serverStartupFailed: () => ERROR_MESSAGES.SERVER.SERVER_STARTUP_FAILED,
  uncaughtException: () => ERROR_MESSAGES.SERVER.UNCAUGHT_EXCEPTION,
  unhandledRejection: () => ERROR_MESSAGES.SERVER.UNHANDLED_REJECTION,

  // Success
  csvProcessed: () => ERROR_MESSAGES.SUCCESS.CSV_PROCESSED,
  flashcardCreated: () => ERROR_MESSAGES.SUCCESS.FLASHCARD_CREATED,
  flashcardUpdated: () => ERROR_MESSAGES.SUCCESS.FLASHCARD_UPDATED,
  healthCheck: () => ERROR_MESSAGES.SUCCESS.HEALTH_CHECK,
  maintenanceTaskCompleted: () => ERROR_MESSAGES.SUCCESS.MAINTENANCE_TASK_COMPLETED
};

// Export console messages for logging
export const ConsoleMessages = ERROR_MESSAGES.CONSOLE;

export default ERROR_MESSAGES;
