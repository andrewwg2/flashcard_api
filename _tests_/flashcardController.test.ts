
import request from 'supertest';
import app from '../src/app'; // Import your Express app
import mongoose from 'mongoose';
import Flashcard from '../src/models/flashcardModel';
import dotenv from 'dotenv';


dotenv.config();

const base = '/api/flashcards';
const buildUrl = (path: string) => `${base}${path}`; // Helper function





describe('Flashcard Controller', () => {
  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI!);
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  });

  afterAll(async () => {
    await Flashcard.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Flashcard.deleteMany({});
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Ensure mocks are reset after each test
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

    it('should return 500 if required fields are missing', async () => {
      const res = await request(app)
        .post(buildUrl('/add'))
        .send({
          spanishWord: 'Hola',
          category: 'Greetings',
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Failed to add flashcard');
    });
  });

  describe('GET /all', () => {
    it('should get all flashcards', async () => {
      await Flashcard.create({
        spanishWord: 'Hola',
        englishWord: 'Hello',
        category: 'Greetings',
      });

      const res = await request(app).get(buildUrl('/all'));

      expect(res.statusCode).toEqual(200);
      expect(res.body.flashcards).toHaveLength(1);
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Flashcard, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get(buildUrl('/all'));

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Failed to get flashcards');
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

    it('should return 404 if flashcard is not found', async () => {
      const res = await request(app)
        .put(buildUrl('/update/nonexistentid'))
        .send({
          isCorrect: true,
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Failed to update flashcard');
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Flashcard, 'findById').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .put(buildUrl('/update/nonexistentid'))
        .send({
          isCorrect: true,
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Failed to update flashcard');
    });
  });

  describe('GET /needpractice/:category', () => {
    it('should get flashcards with percentageCorrect less than 50% in a specific category', async () => {
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
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('percentageCorrect', 0.3);
    });

    it('should return 404 if no flashcards are found', async () => {
      const res = await request(app).get(buildUrl('/needpractice/NonexistentCategory'));

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty(
        'error',
        'No flashcards found with the specified category and percentageCorrect'
      );
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Flashcard, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get(buildUrl('/needpractice/Greetings'));

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Failed to get flashcards');
    });
  });
});
