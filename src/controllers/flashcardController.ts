import { Request, Response, NextFunction } from 'express';
import { flashcardService } from '../services/flashcardService';
import { asyncHandler, errorUtils, NotFoundError, FileProcessingError } from '../middleware/errorHandler';
import { 
  CreateFlashcardDto, 
  UpdateFlashcardStatsDto, 
  FlashcardQueryDto 
} from '../dto/flashcardDto';

// Update a flashcard - now with proper error handling and DTO
export const updateFlashcard = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { isCorrect } = req.body;

  // Validate input
  errorUtils.validateFlashcardUpdate(isCorrect);

  // Create DTO
  const updateDto: UpdateFlashcardStatsDto = {
    id,
    isCorrect
  };

  // Update flashcard
  const flashcard = await flashcardService.updateFlashcardStats(updateDto);

  // Check if flashcard exists
  errorUtils.throwIfNotFound(flashcard, 'Flashcard');

  res.status(200).json(flashcard);
});

// Add a new flashcard - with enhanced error handling and DTO
export const addFlashcard = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { spanishWord, englishWord, category } = req.body;

  // Create DTO
  const createDto: CreateFlashcardDto = {
    spanishWord,
    englishWord,
    category
  };

  const newFlashcard = await flashcardService.createFlashcard(createDto);
  
  res.status(201).json(newFlashcard);
});

// Get all flashcards with validated pagination using DTO
export const getFlashcards = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10 } = req.query;

  // Validate and parse pagination parameters
  const validatedOptions = errorUtils.validatePagination(page, limit);
  
  // Create query DTO
  const queryDto: FlashcardQueryDto = {
    page: validatedOptions.page,
    limit: validatedOptions.limit
  };

  const result = await flashcardService.getFlashcardsWithPagination(queryDto);
  
  res.status(200).json(result);
});

// Get flashcards needing practice with better error handling
export const getFlashcardsMostWrong = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { category } = req.params;

  const flashcards = await flashcardService.getFlashcardsNeedingPractice(category);

  if (flashcards.length === 0) {
    throw new NotFoundError(
      `No flashcards found in category '${category}' that need practice`,
      { category, criteria: 'percentageCorrect < 50%' }
    );
  }

  res.status(200).json(flashcards);
});

// Upload CSV with comprehensive error handling
export const uploadCSV = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { csvFilePath } = req.body;

  // Validate CSV file
  errorUtils.validateCSVFile(csvFilePath);

  try {
    await flashcardService.processCSVUpload(csvFilePath);
    
    res.status(200).json({
      success: true,
      message: 'CSV file processed successfully',
      filePath: csvFilePath
    });
  } catch (error: any) {
    // Throw a more specific error for CSV processing
    throw new FileProcessingError(
      `Failed to process CSV file: ${error.message}`,
      { filePath: csvFilePath, originalError: error.message }
    );
  }
});
