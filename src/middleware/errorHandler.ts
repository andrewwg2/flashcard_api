import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ErrorMessages, ConsoleMessages, formatErrorMessage } from '../constants/errorMessages';

// Custom error types for specific error scenarios
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: string;
  details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes for different scenarios
export class ValidationError extends AppError {
  constructor(message?: string, details?: any) {
    const errorConfig = ErrorMessages.requestValidationFailed();
    super(message || errorConfig.message, errorConfig.statusCode, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message?: string, details?: any) {
    const errorConfig = ErrorMessages.resourceNotFound();
    super(message || errorConfig.message, errorConfig.statusCode, details);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message?: string, details?: any) {
    const errorConfig = ErrorMessages.unauthorizedAccess();
    super(message || errorConfig.message, errorConfig.statusCode, details);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message?: string, details?: any) {
    const errorConfig = ErrorMessages.accessForbidden();
    super(message || errorConfig.message, errorConfig.statusCode, details);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message?: string, details?: any) {
    const errorConfig = ErrorMessages.resourceConflict();
    super(message || errorConfig.message, errorConfig.statusCode, details);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message?: string, details?: any) {
    const errorConfig = ErrorMessages.databaseOperationFailed();
    super(message || errorConfig.message, errorConfig.statusCode, details);
    this.name = 'DatabaseError';
  }
}

export class FileProcessingError extends AppError {
  constructor(message?: string, details?: any) {
    const errorConfig = ErrorMessages.fileProcessingFailed();
    super(message || errorConfig.message, errorConfig.statusCode, details);
    this.name = 'FileProcessingError';
  }
}

// Error response interface for consistent error structure
interface ErrorResponse {
  status: string;
  statusCode: number;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
  stack?: string;
}

// Helper function to create error response
const createErrorResponse = (
  error: AppError | Error,
  req: Request,
  isDevelopment: boolean
): ErrorResponse => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const status = error instanceof AppError ? error.status : 'error';
  
  const response: ErrorResponse = {
    status,
    statusCode,
    message: error.message || ErrorMessages.internalServerError().message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  // Include details if available
  if (error instanceof AppError && error.details) {
    response.details = error.details;
  }

  // Include stack trace in development environment
  if (isDevelopment && error.stack) {
    response.stack = error.stack;
  }

  return response;
};

// Handle specific MongoDB/Mongoose errors
const handleMongooseError = (error: any): AppError => {
  // Handle CastError (invalid ObjectId)
  if (error instanceof mongoose.Error.CastError) {
    const errorConfig = ErrorMessages.invalidObjectId(error.path, error.value);
    return new ValidationError(errorConfig.message, { field: error.path, value: error.value });
  }

  // Handle ValidationError
  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
    }));
    const errorConfig = ErrorMessages.validationFailed();
    return new ValidationError(errorConfig.message, errors);
  }

  // Handle duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    const errorConfig = ErrorMessages.duplicateFieldValue(field, value);
    return new ConflictError(errorConfig.message, { field, value });
  }

  // Handle other database errors
  const errorConfig = ErrorMessages.databaseOperationFailed();
  return new DatabaseError(errorConfig.message, { 
    code: error.code,
    codeName: error.codeName 
  });
};

// Async error wrapper to catch async errors in route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Log error for debugging
 if (isDevelopment) {
  console.error('Error:', {
    name: error.name,
    message: error.message,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(error instanceof AppError && { details: error.details }),
    ...(error instanceof ValidationError && { validationDetails: error.details }),
    stack: error.stack,
  });
} else {
    // Log only essential information in production
    if (error instanceof AppError) {
  console.error('Error:', {
    name: error.name,
    message: error.message,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    statusCode: error.statusCode,
    status: error.status,
    details: error.details,
    stack: isDevelopment ? error.stack : undefined,
  });
} else {
  console.error('Unknown Error:', {
    name: error.name,
    message: error.message,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: isDevelopment ? error.stack : undefined,
  });
}
  }

  // Handle different types of errors
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error.name === 'MongoError' || error.name === 'MongooseError' || 
             error instanceof mongoose.Error) {
    appError = handleMongooseError(error);
  } else if (error.name === 'JsonWebTokenError') {
    const errorConfig = ErrorMessages.invalidToken();
    appError = new UnauthorizedError(errorConfig.message);
  } else if (error.name === 'TokenExpiredError') {
    const errorConfig = ErrorMessages.tokenExpired();
    appError = new UnauthorizedError(errorConfig.message);
  } else if (error.name === 'MulterError') {
    const errorConfig = ErrorMessages.fileUploadError(error.message);
    appError = new ValidationError(errorConfig.message);
  } else {
    // Handle unknown errors
    const errorConfig = ErrorMessages.internalServerError();
    appError = new AppError(
      isDevelopment ? error.message : errorConfig.message,
      errorConfig.statusCode
    );
  }

  // Create and send error response
  const errorResponse = createErrorResponse(appError, req, isDevelopment);
  res.status(errorResponse.statusCode).json(errorResponse);
};

// Not found handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const errorConfig = ErrorMessages.routeNotFound(req.originalUrl);
  const error = new NotFoundError(
    errorConfig.message,
    { method: req.method, url: req.originalUrl }
  );
  next(error);
};

// Validation middleware factory for request validation
export const validateRequest = (schema: any, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      const errors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      const errorConfig = ErrorMessages.requestValidationFailed();
      return next(new ValidationError(errorConfig.message, errors));
    }
    
    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

// Rate limit error handler
export class RateLimitError extends AppError {
  constructor(message?: string, retryAfter?: number) {
    const errorConfig = ErrorMessages.tooManyRequests();
    super(message || errorConfig.message, errorConfig.statusCode, { retryAfter });
    this.name = 'RateLimitError';
  }
}

// Export error utilities for use in controllers
export const errorUtils = {
  // Helper to throw specific errors based on conditions
  throwIfNotFound: (resource: any, resourceName: string = 'Resource') => {
    if (!resource) {
      const errorConfig = ErrorMessages.genericResourceNotFound(resourceName);
      throw new NotFoundError(errorConfig.message);
    }
    return resource;
  },

  // Helper to handle duplicate flashcard errors
  throwIfDuplicate: async (model: any, query: any, message: string) => {
    const exists = await model.findOne(query);
    if (exists) {
      const errorConfig = ErrorMessages.duplicateResource(message);
      throw new ConflictError(errorConfig.message, query);
    }
  },

  // Helper to validate pagination parameters
  validatePagination: (page: any, limit: any) => {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      const errorConfig = ErrorMessages.invalidPageNumber();
      throw new ValidationError(errorConfig.message, { page });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      const errorConfig = ErrorMessages.invalidLimit();
      throw new ValidationError(errorConfig.message, { limit });
    }

    return { page: pageNum, limit: limitNum };
  },

  // Helper to validate flashcard update data
  validateFlashcardUpdate: (data: any) => {
    if (data.isCorrect !== undefined && typeof data.isCorrect !== 'boolean') {
      const errorConfig = ErrorMessages.invalidBoolean();
      throw new ValidationError(errorConfig.message, { isCorrect: data.isCorrect });
    }
    
    if (data.favorite !== undefined && typeof data.favorite !== 'boolean') {
      const errorConfig = ErrorMessages.invalidBoolean();
      throw new ValidationError(errorConfig.message, { favorite: data.favorite });
    }
  },

  // Helper to validate CSV file
  validateCSVFile: (filePath: string | undefined) => {
    if (!filePath) {
      const errorConfig = ErrorMessages.csvFileRequired();
      throw new ValidationError(errorConfig.message);
    }
    
    if (!filePath.endsWith('.csv')) {
      const errorConfig = ErrorMessages.invalidCsvFile();
      throw new FileProcessingError(errorConfig.message, { filePath });
    }
  },
};

export default errorHandler;
