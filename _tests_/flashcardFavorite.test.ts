import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import Flashcard from '../src/models/flashcardModel';
import dotenv from 'dotenv';
import {
  FlashcardDataFactory,
  FlashcardRequestFactory,
  FlashcardAssertionHelpers,
  ApiUrlBuilder,
  TestDatabaseHelpers,
  TestErrorFactory,
} from './factories';

dotenv.config();

describe('Flashcard Favorite Functionality', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI!);
  });

  afterAll(async () => {
    await Flashcard.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Flashcard.deleteMany({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('PUT /favorite/:id', () => {
    it('should mark a flashcard as favorite', async () => {
      // Create a test flashcard
      const flashcard = await Flashcard.create(FlashcardDataFactory.create({
        favorite: false
      })) as any;

      const res = await request(app)
        .put(ApiUrlBuilder.favorite(flashcard._id.toString()))
        .send({ favorite: true });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('favorite', true);
      expect(res.body).toHaveProperty('id', flashcard._id.toString());
    });

    it('should remove a flashcard from favorites', async () => {
      // Create a test flashcard that is already favorited
      const flashcard = await Flashcard.create(FlashcardDataFactory.create({
        favorite: true
      })) as any;

      const res = await request(app)
        .put(ApiUrlBuilder.favorite(flashcard._id.toString()))
        .send({ favorite: false });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('favorite', false);
      expect(res.body).toHaveProperty('id', flashcard._id.toString());
    });

    it('should return 400 if favorite field is not boolean', async () => {
      const flashcard = await Flashcard.create(FlashcardDataFactory.create()) as any;

      const res = await request(app)
        .put(ApiUrlBuilder.favorite(flashcard._id.toString()))
        .send({ favorite: 'invalid' });

      FlashcardAssertionHelpers.assertValidationError(res, 'favorite', 'must be a boolean');
    });

    it('should return 400 if ID is invalid', async () => {
      const invalidId = TestDatabaseHelpers.generateInvalidObjectId();
      
      const res = await request(app)
        .put(ApiUrlBuilder.favorite(invalidId))
        .send({ favorite: true });

      FlashcardAssertionHelpers.assertBadRequest(res);
    });

    it('should return 404 if flashcard is not found', async () => {
      const nonExistentId = TestDatabaseHelpers.generateObjectId();
      
      const res = await request(app)
        .put(ApiUrlBuilder.favorite(nonExistentId.toString()))
        .send({ favorite: true });

      FlashcardAssertionHelpers.assertNotFound(res);
    });

    it('should persist favorite status in database', async () => {
      const flashcard = await Flashcard.create(FlashcardDataFactory.create({
        favorite: false
      })) as any;

      // Mark as favorite
      await request(app)
        .put(ApiUrlBuilder.favorite(flashcard._id.toString()))
        .send({ favorite: true });

      // Verify in database
      const updatedFlashcard = await Flashcard.findById(flashcard._id);
      expect(updatedFlashcard?.favorite).toBe(true);
    });

    it('should return 500 if there is a server error', async () => {
      const flashcard = await Flashcard.create(FlashcardDataFactory.create()) as any;
      
      jest.spyOn(Flashcard, 'findById').mockImplementationOnce(() => {
        throw TestErrorFactory.createInternalServerError();
      });

      const res = await request(app)
        .put(ApiUrlBuilder.favorite(flashcard._id.toString()))
        .send({ favorite: true });

      FlashcardAssertionHelpers.assertServerError(res);
    });
  });

  describe('GET /all - favorite status verification', () => {
    it('should include favorite status in flashcard responses', async () => {
      // Create flashcards with different favorite statuses
      await Flashcard.create([
        FlashcardDataFactory.create({ 
          spanishWord: 'Hola', 
          englishWord: 'Hello',
          favorite: true 
        }),
        FlashcardDataFactory.create({ 
          spanishWord: 'Adios', 
          englishWord: 'Goodbye',
          favorite: false 
        })
      ]);

      const res = await request(app).get(ApiUrlBuilder.getAll());

      expect(res.statusCode).toEqual(200);
      expect(res.body.flashcards).toHaveLength(2);
      
      const favoriteFlashcard = res.body.flashcards.find((f: any) => f.spanishWord === 'Hola');
      const nonFavoriteFlashcard = res.body.flashcards.find((f: any) => f.spanishWord === 'Adios');
      
      expect(favoriteFlashcard).toHaveProperty('favorite', true);
      expect(nonFavoriteFlashcard).toHaveProperty('favorite', false);
    });
  });
});
