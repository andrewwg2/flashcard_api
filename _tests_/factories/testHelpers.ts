import mongoose from 'mongoose';
import { TestErrorMessages, ErrorMessages } from '../constants/testErrorMessages';

/**
 * Test database helpers
 */
export class TestDatabaseHelpers {
  /**
   * Generate a valid MongoDB ObjectId
   */
  static generateObjectId(): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId();
  }

  /**
   * Generate a valid MongoDB ObjectId as string
   */
  static generateObjectIdString(): string {
    return new mongoose.Types.ObjectId().toString();
  }

  /**
   * Generate an invalid MongoDB ObjectId string
   */
  static generateInvalidObjectId(): string {
    return 'invalid-id';
  }
}

/**
 * Pagination helpers for tests
 */
export class PaginationTestHelpers {
  /**
   * Create default pagination options
   */
  static createDefaultOptions(): { page: number; limit: number } {
    return {
      page: 1,
      limit: 10,
    };
  }

  /**
   * Create custom pagination options
   */
  static createOptions(page: number, limit: number): { page: number; limit: number } {
    return {
      page,
      limit,
    };
  }

  /**
   * Create expected pagination response
   */
  static createExpectedPagination(
    currentPage: number,
    totalPages: number,
    totalFlashcards: number
  ): any {
    return {
      currentPage,
      totalPages,
      totalFlashcards,
    };
  }
}

/**
 * Error factory for creating test errors
 */
export class TestErrorFactory {
  /**
   * Create a Mongoose CastError
   */
  static createCastError(): mongoose.Error.CastError {
    return new mongoose.Error.CastError('type', 'value', 'path');
  }

  /**
   * Create a generic error
   */
  static createGenericError(message: string = 'Test error'): Error {
    return new Error(message);
  }

  /**
   * Create an internal server error
   */
  static createInternalServerError(): Error {
    const config = ErrorMessages.internalServerError();
    return new Error(config.message);
  }
}

/**
 * URL builder for API endpoints
 */
export class ApiUrlBuilder {
  private static baseUrl = '/api/flashcards';

  /**
   * Build a complete API URL
   */
  static build(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  /**
   * Build URL for add endpoint
   */
  static add(): string {
    return this.build('/add');
  }

  /**
   * Build URL for get all endpoint with pagination
   */
  static getAll(page: number = 1, limit: number = 10): string {
    return this.build(`/all?page=${page}&limit=${limit}`);
  }

  /**
   * Build URL for update endpoint
   */
  static update(id: string): string {
    return this.build(`/update/${id}`);
  }

  /**
   * Build URL for need practice endpoint
   */
  static needPractice(category: string): string {
    return this.build(`/practice/${category}`);
  }
}
