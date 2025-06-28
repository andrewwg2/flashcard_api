
import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import Flashcard from '../src/models/flashcardModel';
import dotenv from 'dotenv';

dotenv.config();

const buildUrl = (path: string) => `/api/flashcards${path}`;

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
      const res = await request(app)
        .post(buildUrl('/add'))
        .send({
          spanishWord: 'Hola',
          englishWord: 'Hello',
          category: 'Greetings',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('spanishWord', 'Hola');
      expect(res.body).toHaveProperty('englishWord', 'Hello');
      expect(res.body).toHaveProperty('category', 'Greetings');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post(buildUrl('/add'))
        .send({
          spanishWord: 'Hola',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('status', 'fail');
      expect(res.body).toHaveProperty('message', 'Request validation failed');
      expect(res.body).toHaveProperty('details');
      expect(Array.isArray(res.body.details)).toBe(true);
      expect(res.body.details.some((d: any) => d.field === 'englishWord')).toBe(true);
    });
  });

  describe('GET /all', () => {
    it('should get all flashcards', async () => {
      await Flashcard.create({
        spanishWord: 'Hola',
        englishWord: 'Hello',
        category: 'Greetings',
      });

      const res = await request(app).get(buildUrl('/all?page=1&limit=10'));

      expect(res.statusCode).toEqual(200);
      expect(res.body.flashcards).toHaveLength(1);
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Flashcard, 'find').mockImplementationOnce(() => {
        throw new Error('Internal server error');
      });

      const res = await request(app).get(buildUrl('/all?page=1&limit=10'));

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Internal server error');
    });
  });

  describe('PUT /update/:id', () => {
    it('should update a flashcard', async () => {
      const flashcard = await Flashcard.create({
        spanishWord: 'Hola',
        englishWord: 'Hello',
        category: 'Greetings',
      });

      const res = await request(app)
        .put(buildUrl(`/update/${flashcard._id}`))
        .send({
          isCorrect: true,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('percentageCorrect', 1);
    });

    it('should return 400 if ID is invalid', async () => {
      const res = await request(app)
        .put(buildUrl('/update/invalid-id'))
        .send({ isCorrect: true });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 404 if flashcard is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(buildUrl(`/update/${nonExistentId}`))
        .send({ isCorrect: true });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /needpractice/:category', () => {
    it('should get flashcards with percentageCorrect less than 50% in a category', async () => {
      await Flashcard.create([
        {
          spanishWord: 'Hola',
          englishWord: 'Hello',
          category: 'Greetings',
          percentageCorrect: 0.3,
        },
        {
          spanishWord: 'Adios',
          englishWord: 'Goodbye',
          category: 'Greetings',
          percentageCorrect: 0.6,
        },
      ]);

      const res = await request(app).get(buildUrl('/needpractice/Greetings'));

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('percentageCorrect', 0.3);
    });

    it('should return 404 if no flashcards found', async () => {
      const res = await request(app).get(buildUrl('/needpractice/Greetings'));

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message');
    });
  });
});
