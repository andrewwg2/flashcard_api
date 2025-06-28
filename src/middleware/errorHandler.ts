import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

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
  constructor(message: string, details?: any) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, details);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', details?: any) {
    super(message, 401, details);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', details?: any) {
    super(message, 403, details);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, details);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, details);
    this.name = 'DatabaseError';
  }
}

export class FileProcessingError extends AppError {
  constructor(message: string = 'File processing failed', details?: any) {
    super(message, 422, details);
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
    message: error.message || 'Internal server error',
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
    const message = `Invalid ${error.path}: ${error.value}`;
    return new ValidationError(message, { field: error.path, value: error.value });
  }

  // Handle ValidationError
  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
    }));
    return new ValidationError('Validation failed', errors);
  }

  // Handle duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    const message = `Duplicate value for field '${field}': ${value}`;
    return new ConflictError(message, { field, value });
  }

  // Handle other database errors
  return new DatabaseError('Database operation failed', { 
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
    appError = new UnauthorizedError('Invalid token');
  } else if (error.name === 'TokenExpiredError') {
    appError = new UnauthorizedError('Token expired');
  } else if (error.name === 'MulterError') {
    appError = new ValidationError(`File upload error: ${error.message}`);
  } else {
    // Handle unknown errors
    appError = new AppError(
      isDevelopment ? error.message : 'Internal server error',
      500
    );
  }

  // Create and send error response
  const errorResponse = createErrorResponse(appError, req, isDevelopment);
  res.status(errorResponse.statusCode).json(errorResponse);
};

// Not found handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(
    `The requested resource '${req.originalUrl}' was not found on this server.`,
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
      
      return next(new ValidationError('Request validation failed', errors));
    }
    
    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

// Rate limit error handler
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message, 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

// Export error utilities for use in controllers
export const errorUtils = {
  // Helper to throw specific errors based on conditions
  throwIfNotFound: (resource: any, resourceName: string = 'Resource') => {
    if (!resource) {
      throw new NotFoundError(`${resourceName} not found`);
    }
    return resource;
  },

  // Helper to handle duplicate flashcard errors
  throwIfDuplicate: async (model: any, query: any, message: string) => {
    const exists = await model.findOne(query);
    if (exists) {
      throw new ConflictError(message, query);
    }
  },

  // Helper to validate pagination parameters
  validatePagination: (page: any, limit: any) => {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      throw new ValidationError('Invalid page number', { page });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new ValidationError('Invalid limit (must be between 1 and 100)', { limit });
    }

    return { page: pageNum, limit: limitNum };
  },

  // Helper to validate flashcard update data
  validateFlashcardUpdate: (isCorrect: any) => {
    if (typeof isCorrect !== 'boolean') {
      throw new ValidationError('isCorrect must be a boolean value', { isCorrect });
    }
  },

  // Helper to validate CSV file
  validateCSVFile: (filePath: string | undefined) => {
    if (!filePath) {
      throw new ValidationError('CSV file path is required');
    }
    
    if (!filePath.endsWith('.csv')) {
      throw new FileProcessingError('File must be a CSV file', { filePath });
    }
  },
};

export default errorHandler;
