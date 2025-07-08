/**
 * Test file to verify that all factories work correctly
 */

import mongoose from 'mongoose';
import {
  FlashcardDataFactory,
  MockFlashcardFactory,
  FlashcardRequestFactory,
  FlashcardAssertionHelpers,
  TestDatabaseHelpers,
  PaginationTestHelpers,
  TestErrorFactory,
  ApiUrlBuilder,
} from './index';

describe('Test Factories', () => {
  describe('FlashcardDataFactory', () => {
    it('should create a flashcard with default values', () => {
      const flashcard = FlashcardDataFactory.create();
      
      expect(flashcard).toHaveProperty('spanishWord', 'Hola');
      expect(flashcard).toHaveProperty('englishWord', 'Hello');
      expect(flashcard).toHaveProperty('category', 'Greetings');
      expect(flashcard).toHaveProperty('percentageCorrect', 0.5);
    });

    it('should create a flashcard with custom values', () => {
      const flashcard = FlashcardDataFactory.create({
        spanishWord: 'Adiós',
        category: 'Farewells',
      });
      
      expect(flashcard).toHaveProperty('spanishWord', 'Adiós');
      expect(flashcard).toHaveProperty('category', 'Farewells');
      expect(flashcard).toHaveProperty('englishWord', 'Hello'); // Default value
    });

    it('should create multiple flashcards', () => {
      const flashcards = FlashcardDataFactory.createMany(3);
      
      expect(flashcards).toHaveLength(3);
      flashcards.forEach(card => {
        expect(card).toHaveProperty('spanishWord');
        expect(card).toHaveProperty('englishWord');
      });
    });

    it('should create a flashcard that needs practice', () => {
      const flashcard = FlashcardDataFactory.createNeedsPractice();
      
      expect(flashcard.percentageCorrect).toBe(0.3);
      expect(flashcard.percentageCorrect).toBeLessThan(0.5);
    });

    it('should create a high performance flashcard', () => {
      const flashcard = FlashcardDataFactory.createHighPerformance();
      
      expect(flashcard.percentageCorrect).toBe(0.8);
      expect(flashcard.percentageCorrect).toBeGreaterThan(0.5);
    });
  });

  describe('MockFlashcardFactory', () => {
    it('should create a mock flashcard with jest functions', () => {
      const mock = MockFlashcardFactory.create();
      
      expect(mock).toHaveProperty('_id');
      expect(mock).toHaveProperty('updateStats');
      expect(mock).toHaveProperty('save');
      expect(typeof mock.updateStats).toBe('function');
      expect(typeof mock.save).toBe('function');
    });

    it('should create multiple mock flashcards', () => {
      const mocks = MockFlashcardFactory.createMany(2, [
        { spanishWord: 'uno' },
        { spanishWord: 'dos' },
      ]);
      
      expect(mocks).toHaveLength(2);
      expect(mocks[0].spanishWord).toBe('uno');
      expect(mocks[1].spanishWord).toBe('dos');
    });

    it('should create a query builder mock', () => {
      const returnValue = ['test'];
      const queryBuilder = MockFlashcardFactory.createQueryBuilder(returnValue);

      expect(queryBuilder).toHaveProperty('skip');
      expect(queryBuilder).toHaveProperty('limit');
      expect(queryBuilder.skip()).toBe(queryBuilder); // Returns this
      expect(queryBuilder.limit()).toEqual(returnValue);
    });
  });

  describe('FlashcardRequestFactory', () => {
    it('should create a valid add request', () => {
      const request = FlashcardRequestFactory.createAddRequest();
      
      expect(request).toHaveProperty('spanishWord', 'Hola');
      expect(request).toHaveProperty('englishWord', 'Hello');
      expect(request).toHaveProperty('category', 'Greetings');
    });

    it('should create an update request', () => {
      const request = FlashcardRequestFactory.createUpdateRequest(true);
      
      expect(request).toHaveProperty('isCorrect', true);
    });

    it('should create an invalid request', () => {
      const request = FlashcardRequestFactory.createInvalidRequest();
      
      expect(request).toHaveProperty('spanishWord');
      expect(request).not.toHaveProperty('englishWord');
    });
  });

  describe('TestDatabaseHelpers', () => {
    it('should generate valid ObjectId', () => {
      const objectId = TestDatabaseHelpers.generateObjectId();
      
      expect(objectId).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(mongoose.Types.ObjectId.isValid(objectId)).toBe(true);
    });

    it('should generate ObjectId string', () => {
      const objectIdStr = TestDatabaseHelpers.generateObjectIdString();
      
      expect(typeof objectIdStr).toBe('string');
      expect(mongoose.Types.ObjectId.isValid(objectIdStr)).toBe(true);
    });

    it('should generate invalid ObjectId', () => {
      const invalidId = TestDatabaseHelpers.generateInvalidObjectId();
      
      expect(invalidId).toBe('invalid-id');
      expect(mongoose.Types.ObjectId.isValid(invalidId)).toBe(false);
    });
  });

  describe('PaginationTestHelpers', () => {
    it('should create default pagination options', () => {
      const options = PaginationTestHelpers.createDefaultOptions();
      
      expect(options).toEqual({ page: 1, limit: 10 });
    });

    it('should create custom pagination options', () => {
      const options = PaginationTestHelpers.createOptions(3, 20);
      
      expect(options).toEqual({ page: 3, limit: 20 });
    });

    it('should create expected pagination response', () => {
      const pagination = PaginationTestHelpers.createExpectedPagination(2, 5, 50);
      
      expect(pagination).toEqual({
        currentPage: 2,
        totalPages: 5,
        totalFlashcards: 50,
      });
    });
  });

  describe('TestErrorFactory', () => {
    it('should create a CastError', () => {
      const error = TestErrorFactory.createCastError();
      
      expect(error).toBeInstanceOf(mongoose.Error.CastError);
    });

    it('should create a generic error', () => {
      const error = TestErrorFactory.createGenericError('Test message');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test message');
    });

    it('should create an internal server error', () => {
      const error = TestErrorFactory.createInternalServerError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Internal server error');
    });
  });

  describe('ApiUrlBuilder', () => {
    it('should build custom path', () => {
      const url = ApiUrlBuilder.build('/custom');
      
      expect(url).toBe('/api/flashcards/custom');
    });

    it('should build add endpoint', () => {
      const url = ApiUrlBuilder.add();
      
      expect(url).toBe('/api/flashcards/add');
    });

    it('should build get all endpoint', () => {
      const url = ApiUrlBuilder.getAll(2, 20);
      
      expect(url).toBe('/api/flashcards/all?page=2&limit=20');
    });

    it('should build update endpoint', () => {
      const url = ApiUrlBuilder.update('test-id');
      
      expect(url).toBe('/api/flashcards/update/test-id');
    });

    it('should build need practice endpoint', () => {
      const url = ApiUrlBuilder.needPractice('Verbs');
      
      expect(url).toBe('/api/flashcards/practice/Verbs');
    });
  });

  describe('FlashcardAssertionHelpers', () => {
    it('should have assertion methods', () => {
      // Just verify the methods exist
      expect(FlashcardAssertionHelpers.assertValidationError).toBeInstanceOf(Function);
      expect(FlashcardAssertionHelpers.assertFlashcardCreated).toBeInstanceOf(Function);
      expect(FlashcardAssertionHelpers.assertServerError).toBeInstanceOf(Function);
      expect(FlashcardAssertionHelpers.assertNotFound).toBeInstanceOf(Function);
      expect(FlashcardAssertionHelpers.assertBadRequest).toBeInstanceOf(Function);
    });
  });
});
