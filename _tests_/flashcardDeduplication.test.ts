import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import Flashcard from '../src/models/flashcardModel';
import dotenv from 'dotenv';
import { TestDatabase } from './helpers/testDatabase';
import {
  FlashcardDataFactory,
  FlashcardAssertionHelpers,
  ApiUrlBuilder,
  TestDatabaseHelpers,
  TestErrorFactory,
} from './factories';

dotenv.config();

describe('Flashcard Deduplication Functionality', () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  });

  afterAll(async () => {
    await TestDatabase.clearDatabase();
    await TestDatabase.disconnect();
  });

  beforeEach(async () => {
    await TestDatabase.clearDatabase();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /maintenance/deduplicate', () => {
    it('should remove duplicate flashcards with no usage data', async () => {
      // Create duplicate flashcards - one with usage data, one without
      const flashcardsData = [
        FlashcardDataFactory.create({
          spanishWord: 'Hola',
          englishWord: 'Hello',
          category: 'Greetings',
          percentageCorrect: 0.7,
          timesSeen: 5
        }),
        FlashcardDataFactory.create({
          spanishWord: 'Hola', // Same Spanish word (duplicate)
          englishWord: 'Hello',
          category: 'Greetings',
          percentageCorrect: 0,
          timesSeen: 0
        })
      ];

      await Flashcard.create(flashcardsData);

      const res = await request(app)
        .post(ApiUrlBuilder.deduplicate());

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('task', 'deDuplicate');
      expect(res.body.result).toHaveProperty('duplicateGroupsFound', 1);
      expect(res.body.result).toHaveProperty('recordsDeleted', 1);
      expect(res.body.result).toHaveProperty('remainingRecords', 1);
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should keep one record when all duplicates have no usage data', async () => {
      // Create multiple duplicates with no usage data
      const flashcardsData = [
        FlashcardDataFactory.create({
          spanishWord: 'Adios',
          englishWord: 'Goodbye',
          percentageCorrect: 0,
          timesSeen: 0
        }),
        FlashcardDataFactory.create({
          spanishWord: 'Adios', // Same Spanish word (duplicate)
          englishWord: 'Goodbye',
          percentageCorrect: 0,
          timesSeen: 0
        }),
        FlashcardDataFactory.create({
          spanishWord: 'Adios', // Same Spanish word (duplicate)
          englishWord: 'Goodbye',
          percentageCorrect: 0,
          timesSeen: 0
        })
      ];

      await Flashcard.create(flashcardsData);

      const res = await request(app)
        .post(ApiUrlBuilder.deduplicate());

      expect(res.statusCode).toEqual(200);
      expect(res.body.result).toHaveProperty('duplicateGroupsFound', 1);
      expect(res.body.result).toHaveProperty('recordsDeleted', 2);
      expect(res.body.result).toHaveProperty('remainingRecords', 1);
    });

    it('should handle multiple duplicate groups', async () => {
      // Create multiple groups of duplicates
      const flashcardsData = [
        // Group 1: Hola duplicates
        FlashcardDataFactory.create({
          spanishWord: 'Hola',
          englishWord: 'Hello',
          percentageCorrect: 0.5,
          timesSeen: 3
        }),
        FlashcardDataFactory.create({
          spanishWord: 'Hola',
          englishWord: 'Hello',
          percentageCorrect: 0,
          timesSeen: 0
        }),
        // Group 2: Gracias duplicates
        FlashcardDataFactory.create({
          spanishWord: 'Gracias',
          englishWord: 'Thank you',
          percentageCorrect: 0.8,
          timesSeen: 10
        }),
        FlashcardDataFactory.create({
          spanishWord: 'Gracias',
          englishWord: 'Thank you',
          percentageCorrect: 0,
          timesSeen: 0
        })
      ];

      await Flashcard.create(flashcardsData);

      const res = await request(app)
        .post(ApiUrlBuilder.deduplicate());

      expect(res.statusCode).toEqual(200);
      expect(res.body.result).toHaveProperty('duplicateGroupsFound', 2);
      expect(res.body.result).toHaveProperty('recordsDeleted', 2);
      expect(res.body.result).toHaveProperty('remainingRecords', 2);
    });

    it('should not delete anything when no duplicates exist', async () => {
      // Create unique flashcards
      const flashcardsData = [
        FlashcardDataFactory.create({
          spanishWord: 'Hola',
          englishWord: 'Hello'
        }),
        FlashcardDataFactory.create({
          spanishWord: 'Adios',
          englishWord: 'Goodbye'
        }),
        FlashcardDataFactory.create({
          spanishWord: 'Gracias',
          englishWord: 'Thank you'
        })
      ];

      await Flashcard.create(flashcardsData);

      const res = await request(app)
        .post(ApiUrlBuilder.deduplicate());

      expect(res.statusCode).toEqual(200);
      expect(res.body.result).toHaveProperty('duplicateGroupsFound', 0);
      expect(res.body.result).toHaveProperty('recordsDeleted', 0);
      expect(res.body.result).toHaveProperty('remainingRecords', 3);
    });

    it('should preserve flashcards with usage data over those without', async () => {
      // Create duplicates where one has better usage data
      const flashcardsData = [
        FlashcardDataFactory.create({
          spanishWord: 'Buenos',
          englishWord: 'Good',
          percentageCorrect: 0,
          timesSeen: 0
        }),
        FlashcardDataFactory.create({
          spanishWord: 'Buenos',
          englishWord: 'Good',
          percentageCorrect: 0.9,
          timesSeen: 15
        })
      ];

      await Flashcard.create(flashcardsData);

      const res = await request(app)
        .post(ApiUrlBuilder.deduplicate());

      expect(res.statusCode).toEqual(200);
      expect(res.body.result).toHaveProperty('recordsDeleted', 1);
      expect(res.body.result).toHaveProperty('remainingRecords', 1);

      // Verify the correct record was kept
      const remainingFlashcards = await Flashcard.find({ spanishWord: 'Buenos' });
      expect(remainingFlashcards).toHaveLength(1);
      expect(remainingFlashcards[0].percentageCorrect).toBe(0.9);
      expect(remainingFlashcards[0].timesSeen).toBe(15);
    });

    it('should return proper response structure', async () => {
      const res = await request(app)
        .post(ApiUrlBuilder.deduplicate());

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('task', 'deDuplicate');
      expect(res.body).toHaveProperty('result');
      expect(res.body.result).toHaveProperty('duplicateGroupsFound');
      expect(res.body.result).toHaveProperty('recordsDeleted');
      expect(res.body.result).toHaveProperty('remainingRecords');
      expect(res.body).toHaveProperty('timestamp');
      
      // Verify timestamp is a valid ISO string
      expect(() => new Date(res.body.timestamp)).not.toThrow();
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Flashcard, 'aggregate').mockImplementationOnce(() => {
        throw TestErrorFactory.createInternalServerError();
      });

      const res = await request(app)
        .post(ApiUrlBuilder.deduplicate());

      FlashcardAssertionHelpers.assertServerError(res);
    });
  });

  describe('Deduplication edge cases', () => {
    it('should handle empty database', async () => {
      const res = await request(app)
        .post(ApiUrlBuilder.deduplicate());

      expect(res.statusCode).toEqual(200);
      expect(res.body.result).toHaveProperty('duplicateGroupsFound', 0);
      expect(res.body.result).toHaveProperty('recordsDeleted', 0);
      expect(res.body.result).toHaveProperty('remainingRecords', 0);
    });

    it('should handle case-sensitive duplicates correctly', async () => {
      // Create flashcards with different cases - these should NOT be considered duplicates
      const flashcardsData = [
        FlashcardDataFactory.create({
          spanishWord: 'hola',
          englishWord: 'hello'
        }),
        FlashcardDataFactory.create({
          spanishWord: 'Hola',
          englishWord: 'Hello'
        })
      ];

      await Flashcard.create(flashcardsData);

      const res = await request(app)
        .post(ApiUrlBuilder.deduplicate());

      expect(res.statusCode).toEqual(200);
      expect(res.body.result).toHaveProperty('duplicateGroupsFound', 0);
      expect(res.body.result).toHaveProperty('recordsDeleted', 0);
      expect(res.body.result).toHaveProperty('remainingRecords', 2);
    });
  });
});
