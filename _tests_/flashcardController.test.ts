
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

describe('Flashcard Controller', () => {
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

  describe('POST /add', () => {
    it('should add a new flashcard', async () => {
      const requestData = FlashcardRequestFactory.createAddRequest();
      
      const res = await request(app)
        .post(ApiUrlBuilder.add())
        .send(requestData);

      FlashcardAssertionHelpers.assertFlashcardCreated(res, requestData);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post(ApiUrlBuilder.add())
        .send(FlashcardRequestFactory.createInvalidRequest());

      FlashcardAssertionHelpers.assertValidationError(res, 'englishWord');
    });
  });

  describe('GET /all', () => {
    it('should get all flashcards', async () => {
      await Flashcard.create(FlashcardDataFactory.create());

      const res = await request(app).get(ApiUrlBuilder.getAll());

      expect(res.statusCode).toEqual(200);
      expect(res.body.flashcards).toHaveLength(1);
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Flashcard, 'find').mockImplementationOnce(() => {
        throw TestErrorFactory.createInternalServerError();
      });

      const res = await request(app).get(ApiUrlBuilder.getAll());

      FlashcardAssertionHelpers.assertServerError(res);
    });
  });

  describe('PUT /update/:id', () => {
      it('should update a flashcard', async () => {
      const flashcard = await Flashcard.create(FlashcardDataFactory.create()) as { id: string };
     
      const res = await request(app)
        .put(ApiUrlBuilder.update(flashcard.id.toString()))
        .send(FlashcardRequestFactory.createUpdateRequest(true));
      
      console.log('DEBUG: Validation details:', res.body.details);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('percentageCorrect', 1);
    });


    it('should return 400 if ID is invalid', async () => {
      const invalidId = TestDatabaseHelpers.generateInvalidObjectId();
      const res = await request(app)
        .put(ApiUrlBuilder.update(invalidId))
        .send(FlashcardRequestFactory.createUpdateRequest());

      FlashcardAssertionHelpers.assertBadRequest(res);
    });

    it('should return 404 if flashcard is not found', async () => {
      const nonExistentId = TestDatabaseHelpers.generateObjectId();
      const res = await request(app)
        .put(ApiUrlBuilder.update(nonExistentId.toString()))
        .send(FlashcardRequestFactory.createUpdateRequest());

      FlashcardAssertionHelpers.assertNotFound(res);
    });
  });

  describe('GET /practice/:category', () => {
    it('should get flashcards with percentageCorrect less than 50% in a category', async () => {
      const flashcardsData = [
        FlashcardDataFactory.createNeedsPractice({
          spanishWord: 'Hola',
          englishWord: 'Hello',
          category: 'Greetings',
        }),
        FlashcardDataFactory.createHighPerformance({
          spanishWord: 'Adios',
          englishWord: 'Goodbye',
          category: 'Greetings',
          percentageCorrect: 0.6,
        }),
      ];

      await Flashcard.create(flashcardsData);

      const res = await request(app).get(ApiUrlBuilder.needPractice('Greetings'));
       console.log('DEBUG: Validation details:', res.body.details);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('percentageCorrect', 0.3);
    });

    it('should return 404 if no flashcards found', async () => {
      const res = await request(app).get(ApiUrlBuilder.needPractice('Greetings'));

      FlashcardAssertionHelpers.assertNotFound(res);
    });
  });
});
