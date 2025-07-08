import { FlashcardService } from '../src/services/flashcardService';
import Flashcard from '../src/models/flashcardModel';
import { createFlashcardsFromCSV } from '../src/CSVUpload';
import {
  MockFlashcardFactory,
  PaginationTestHelpers,
  TestErrorFactory,
  TestDatabaseHelpers,
} from './factories';
import { CreateFlashcardDto, UpdateFlashcardStatsDto, FlashcardQueryDto, FlashcardDtoMapper  } from '../src/dto/flashcardDto';

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
      const testId = TestDatabaseHelpers.generateObjectIdString();
      const mockFlashcard = MockFlashcardFactory.create({ _id: testId });
      (Flashcard.findById as jest.Mock).mockResolvedValue(mockFlashcard);

      const result = await flashcardService.updateFlashcardStats({ id: testId, isCorrect: true });

      expect(Flashcard.findById).toHaveBeenCalledWith(testId);
      expect(mockFlashcard.updateStats).toHaveBeenCalledWith(true);
      expect(mockFlashcard.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should return null when flashcard does not exist', async () => {
      const testId = TestDatabaseHelpers.generateObjectIdString();
      (Flashcard.findById as jest.Mock).mockResolvedValue(null);

      const result = await flashcardService.updateFlashcardStats({ id: testId, isCorrect: true });

      expect(result).toBeNull();
    });
  });

  describe('createFlashcard', () => {
    it('should create a new flashcard', async () => {
      const mockFlashcard = MockFlashcardFactory.create();
      (Flashcard as any).mockImplementation(() => mockFlashcard);

      const dto: CreateFlashcardDto = {
        spanishWord: 'hola',
        englishWord: 'hello',
        category: 'greetings',
      };

      const result = await flashcardService.createFlashcard(dto);

      expect(Flashcard).toHaveBeenCalledWith(dto);
      expect(mockFlashcard.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getFlashcardsWithPagination', () => {
    it('should return paginated flashcards', async () => {
      const mockFlashcards = MockFlashcardFactory.createMany(2, [
        { _id: '1', spanishWord: 'uno', englishWord: 'one' },
        { _id: '2', spanishWord: 'dos', englishWord: 'two' },
      ]);

      const mockFind = MockFlashcardFactory.createQueryBuilder(mockFlashcards);
      (Flashcard.find as jest.Mock).mockReturnValue(mockFind);
      (Flashcard.countDocuments as jest.Mock).mockResolvedValue(20);

      const queryDto: FlashcardQueryDto = { page: 2, limit: 10 };
      const result = await flashcardService.getFlashcardsWithPagination(queryDto);

      expect(Flashcard.find).toHaveBeenCalled();
      expect(mockFind.skip).toHaveBeenCalledWith(10);
      expect(mockFind.limit).toHaveBeenCalledWith(10);
      expect(result.flashcards).toHaveLength(2);
      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe('getFlashcardsNeedingPractice', () => {
    it('should get flashcards with percentageCorrect < 50% for all categories', async () => {
      const mockFlashcards = MockFlashcardFactory.createMany(2, [
        { _id: '1', percentageCorrect: 0.3 },
        { _id: '2', percentageCorrect: 0.4 },
      ]);

      (Flashcard.find as jest.Mock).mockResolvedValue(mockFlashcards);

      const result = await flashcardService.getFlashcardsNeedingPractice('All');

      expect(Flashcard.find).toHaveBeenCalledWith({ percentageCorrect: { $lt: 0.5 } });
      expect(result).toEqual(expect.any(Array));
    });

    it('should filter by category when category is not "All"', async () => {
      const mockFlashcards = [
        MockFlashcardFactory.createNeedsPractice({ _id: '1', category: 'verbs' }),
      ];

      (Flashcard.find as jest.Mock).mockResolvedValue(mockFlashcards);

      const result = await flashcardService.getFlashcardsNeedingPractice('verbs');

      expect(Flashcard.find).toHaveBeenCalledWith({
        percentageCorrect: { $lt: 0.5 },
        category: 'verbs',
      });
      expect(result).toEqual(FlashcardDtoMapper.toDtoList(mockFlashcards));
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
      const error = TestErrorFactory.createCastError();
      const result = flashcardService.isMongooseCastError(error);

      expect(result).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = TestErrorFactory.createGenericError('Regular error');
      const result = flashcardService.isMongooseCastError(error);

      expect(result).toBe(false);
    });
  });
});
