import mongoose from 'mongoose';
import { IFlashcard } from '../../src/models/flashcardModel';
import { TestAssertions, TestErrorMessages } from '../constants/testErrorMessages';

// Flashcard data factory for creating test data
export class FlashcardDataFactory {
  private static defaultFlashcard = {
    id: new mongoose.Types.ObjectId().toString(),  
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

  /**
   * Create a flashcard marked as favorite
   */
  static createFavorite(overrides: Partial<any> = {}): any {
    return this.create({
      favorite: true,
      ...overrides,
    });
  }

  /**
   * Create a flashcard not marked as favorite
   */
  static createNonFavorite(overrides: Partial<any> = {}): any {
    return this.create({
      favorite: false,
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
   * Assert that a validation error response is correct
   */
  static assertValidationError(res: any, expectedField: string): void {
    TestAssertions.assertValidationError(res, expectedField);
  }

  /**
   * Assert that a flashcard creation response is correct
   */
  static assertFlashcardCreated(res: any, expectedData: any): void {
    TestAssertions.assertFlashcardCreated(res, expectedData);
  }

  /**
   * Assert that a server error response is correct
   */
  static assertServerError(res: any, expectedMessage?: string): void {
    TestAssertions.assertServerError(res);
  }

  /**
   * Assert that a not found error response is correct
   */
  static assertNotFound(res: any): void {
    TestAssertions.assertNotFoundError(res);
  }

  /**
   * Assert that a bad request error response is correct
   */
  static assertBadRequest(res: any): void {
    TestAssertions.assertBadRequest(res);
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
   * Create a mock query builder for chaining
   */
  static createQueryBuilder(returnValue: any): any {
    const queryBuilder = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnValue(returnValue),
    };
    return queryBuilder;
  }
}

// Request factory for creating test request data
export class FlashcardRequestFactory {
  /**
   * Create a valid add flashcard request
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
   * Create an update flashcard request
   */
  static createUpdateRequest(isCorrect: boolean = true): any {
    return {
      isCorrect,
    };
  }

  /**
   * Create an invalid request (missing required fields)
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
  static assertValidationError(res: any, expectedField?: string, expectedMessageSubstring: string = 'required'): void {
  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty('status', 'error');
  expect(typeof res.body.message).toBe('string');
  expect(res.body.message.toLowerCase()).toContain(expectedMessageSubstring.toLowerCase());
  expect(res.body).toHaveProperty('details');
  expect(Array.isArray(res.body.details)).toBe(true);

  if (expectedField) {
    expect(res.body.details.some((d: any) => d.path?.[0] === expectedField)).toBe(true);
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
