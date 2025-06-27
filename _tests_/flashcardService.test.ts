import { FlashcardService } from '../src/services/flashcardService';
import Flashcard from '../src/models/flashcardModel';
import { createFlashcardsFromCSV } from '../src/CSVUpload';
import mongoose from 'mongoose';

// Mock the dependencies
jest.mock('../src/models/flashcardModel');
jest.mock('../src/CSVUpload');

describe('FlashcardService', () => {
  let flashcardService: FlashcardService;
  
  beforeEach(() => {
    flashcardService = new FlashcardService();
    jest.clearAllMocks();
  });

  describe('updateFlashcardStats', () => {
    it('should update flashcard stats when flashcard exists', async () => {
      const mockFlashcard = {
        _id: 'test-id',
        updateStats: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };
      
      (Flashcard.findById as jest.Mock).mockResolvedValue(mockFlashcard);

      const result = await flashcardService.updateFlashcardStats('test-id', true);

      expect(Flashcard.findById).toHaveBeenCalledWith('test-id');
      expect(mockFlashcard.updateStats).toHaveBeenCalledWith(true);
      expect(mockFlashcard.save).toHaveBeenCalled();
      expect(result).toBe(mockFlashcard);
    });

    it('should return null when flashcard does not exist', async () => {
      (Flashcard.findById as jest.Mock).mockResolvedValue(null);

      const result = await flashcardService.updateFlashcardStats('test-id', true);

      expect(result).toBeNull();
    });
  });

  describe('createFlashcard', () => {
    it('should create a new flashcard', async () => {
      const mockFlashcard = {
        spanishWord: 'hola',
        englishWord: 'hello',
        category: 'greetings',
        save: jest.fn().mockResolvedValue(true),
      };

      (Flashcard as any).mockImplementation(() => mockFlashcard);

      const result = await flashcardService.createFlashcard('hola', 'hello', 'greetings');

      expect(Flashcard).toHaveBeenCalledWith({
        spanishWord: 'hola',
        englishWord: 'hello',
        category: 'greetings',
      });
      expect(mockFlashcard.save).toHaveBeenCalled();
      expect(result).toBe(mockFlashcard);
    });
  });

  describe('getFlashcardsWithPagination', () => {
    it('should return paginated flashcards', async () => {
      const mockFlashcards = [
        { _id: '1', spanishWord: 'uno', englishWord: 'one' },
        { _id: '2', spanishWord: 'dos', englishWord: 'two' },
      ];

      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockFlashcards),
      };

      (Flashcard.find as jest.Mock).mockReturnValue(mockFind);
      (Flashcard.countDocuments as jest.Mock).mockResolvedValue(20);

      const options = { page: 2, limit: 10 };
      const result = await flashcardService.getFlashcardsWithPagination(options);

      expect(Flashcard.find).toHaveBeenCalled();
      expect(mockFind.skip).toHaveBeenCalledWith(10); // (page-1) * limit
      expect(mockFind.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        flashcards: mockFlashcards,
        pagination: {
          currentPage: 2,
          totalPages: 2,
          totalFlashcards: 20,
        },
      });
    });
  });

  describe('getFlashcardsNeedingPractice', () => {
    it('should get flashcards with percentageCorrect < 50% for all categories', async () => {
      const mockFlashcards = [
        { _id: '1', percentageCorrect: 0.3 },
        { _id: '2', percentageCorrect: 0.4 },
      ];

      (Flashcard.find as jest.Mock).mockResolvedValue(mockFlashcards);

      const result = await flashcardService.getFlashcardsNeedingPractice('All');

      expect(Flashcard.find).toHaveBeenCalledWith({
        percentageCorrect: { $lt: 0.5 },
      });
      expect(result).toEqual(mockFlashcards);
    });

    it('should filter by category when category is not "All"', async () => {
      const mockFlashcards = [
        { _id: '1', percentageCorrect: 0.3, category: 'verbs' },
      ];

      (Flashcard.find as jest.Mock).mockResolvedValue(mockFlashcards);

      const result = await flashcardService.getFlashcardsNeedingPractice('verbs');

      expect(Flashcard.find).toHaveBeenCalledWith({
        percentageCorrect: { $lt: 0.5 },
        category: 'verbs',
      });
      expect(result).toEqual(mockFlashcards);
    });
  });

  describe('processCSVUpload', () => {
    it('should process CSV upload', async () => {
      const csvPath = '/path/to/file.csv';
      
      await flashcardService.processCSVUpload(csvPath);

      expect(createFlashcardsFromCSV).toHaveBeenCalledWith(csvPath);
    });
  });

  describe('isMongooseCastError', () => {
    it('should return true for Mongoose CastError', () => {
      const error = new mongoose.Error.CastError('type', 'value', 'path');
      
      const result = flashcardService.isMongooseCastError(error);

      expect(result).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new Error('Regular error');
      
      const result = flashcardService.isMongooseCastError(error);

      expect(result).toBe(false);
    });
  });
});
