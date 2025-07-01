import mongoose from 'mongoose';
import { IFlashcard } from '../../src/models/flashcardModel';

// Flashcard data factory for creating test data
export class FlashcardDataFactory {
  private static defaultFlashcard = {
    spanishWord: 'Hola',
    englishWord: 'Hello',
    category: 'Greetings',
    percentageCorrect: 0.5,
    timesSeen: 0,
    dateLastSeen: new Date(),
  };

  /**
   * Create a single flashcard test data object
   */
  static create(overrides: Partial<any> = {}): any {
    return {
      ...this.defaultFlashcard,
      ...overrides,
    };
  }

  /**
   * Create multiple flashcard test data objects
   */
  static createMany(count: number, overrides: Partial<any>[] = []): any[] {
    return Array.from({ length: count }, (_, index) => {
      const override = overrides[index] || {};
      return this.create(override);
    });
  }

  /**
   * Create a flashcard with low performance (needs practice)
   */
  static createNeedsPractice(overrides: Partial<any> = {}): any {
    return this.create({
      percentageCorrect: 0.3,
      ...overrides,
    });
  }

  /**
   * Create a flashcard with high performance
   */
  static createHighPerformance(overrides: Partial<any> = {}): any {
    return this.create({
      percentageCorrect: 0.8,
      ...overrides,
    });
  }

  /**
   * Create flashcard data for different categories
   */
  static createWithCategory(category: string, overrides: Partial<any> = {}): any {
    return this.create({
      category,
      ...overrides,
    });
  }
}

// Mock flashcard factory for creating mocked flashcard instances
export class MockFlashcardFactory {
  /**
   * Create a mock flashcard with jest functions
   */
  static create(overrides: Partial<any> = {}): any {
    const mockFlashcard = {
      _id: new mongoose.Types.ObjectId().toString(),
      spanishWord: 'hola',
      englishWord: 'hello',
      category: 'greetings',
      percentageCorrect: 0.5,
      timesSeen: 0,
      updateStats: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
      ...overrides,
    };

    return mockFlashcard;
  }

  /**
   * Create a mock flashcard that needs practice
   */
  static createNeedsPractice(overrides: Partial<any> = {}): any {
    return this.create({
      percentageCorrect: 0.3,
      ...overrides,
    });
  }

  /**
   * Create multiple mock flashcards
   */
  static createMany(count: number, overrides: Partial<any>[] = []): any[] {
    return Array.from({ length: count }, (_, index) => {
      const override = overrides[index] || {};
      return this.create(override);
    });
  }

  /**
   * Create a mock query builder
   */
  static createQueryBuilder(returnValue: any): any {
    return {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(returnValue),
    };
  }
}

// Request builder factory for creating test requests
export class FlashcardRequestFactory {
  /**
   * Create a valid add flashcard request body
   */
  static createAddRequest(overrides: Partial<any> = {}): any {
    return {
      spanishWord: 'Hola',
      englishWord: 'Hello',
      category: 'Greetings',
      ...overrides,
    };
  }

  /**
   * Create an update flashcard request body
   */
  static createUpdateRequest(isCorrect: boolean = true): any {
    return {
      isCorrect,
    };
  }

  /**
   * Create an invalid request body (missing required fields)
   */
  static createInvalidRequest(): any {
    return {
      spanishWord: 'Hola',
      // Missing englishWord
    };
  }
}

// Response assertion helpers
export class FlashcardAssertionHelpers {
  /**
   * Assert validation error response
   */
  static assertValidationError(res: any, expectedField?: string): void {
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('status', 'fail');
    expect(res.body).toHaveProperty('message', 'Request validation failed');
    expect(res.body).toHaveProperty('details');
    expect(Array.isArray(res.body.details)).toBe(true);
    
    if (expectedField) {
      expect(res.body.details.some((d: any) => d.field === expectedField)).toBe(true);
    }
  }

  /**
   * Assert successful flashcard creation
   */
  static assertFlashcardCreated(res: any, expectedData: any): void {
    expect(res.statusCode).toEqual(201);
    if (expectedData.spanishWord) {
      expect(res.body).toHaveProperty('spanishWord', expectedData.spanishWord);
    }
    if (expectedData.englishWord) {
      expect(res.body).toHaveProperty('englishWord', expectedData.englishWord);
    }
    if (expectedData.category) {
      expect(res.body).toHaveProperty('category', expectedData.category);
    }
  }

  /**
   * Assert server error response
   */
  static assertServerError(res: any, expectedMessage: string = 'Internal server error'): void {
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('message', expectedMessage);
  }

  /**
   * Assert not found error
   */
  static assertNotFound(res: any): void {
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message');
  }

  /**
   * Assert bad request error
   */
  static assertBadRequest(res: any): void {
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
  }
}
