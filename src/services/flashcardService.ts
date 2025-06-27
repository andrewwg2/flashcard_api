import Flashcard, { IFlashcard } from '../models/flashcardModel';
import mongoose from 'mongoose';
import { createFlashcardsFromCSV } from '../CSVUpload';

interface PaginationOptions {
  page: number;
  limit: number;
}

interface PaginatedFlashcardsResult {
  flashcards: IFlashcard[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalFlashcards: number;
  };
}

interface FlashcardQuery {
  percentageCorrect?: { $lt: number };
  category?: string;
}

export class FlashcardService {
  /**
   * Update flashcard statistics based on whether the answer was correct
   * @param id - The flashcard ID
   * @param isCorrect - Whether the answer was correct
   * @returns Updated flashcard or null if not found
   */
  async updateFlashcardStats(id: string, isCorrect: boolean): Promise<IFlashcard | null> {
    const flashcard = await Flashcard.findById(id);
    
    if (!flashcard) {
      return null;
    }

    flashcard.updateStats(isCorrect);
    await flashcard.save();
    
    return flashcard;
  }

  /**
   * Create a new flashcard
   * @param spanishWord - Spanish word
   * @param englishWord - English translation
   * @param category - Category of the flashcard
   * @returns Created flashcard
   */
  async createFlashcard(
    spanishWord: string, 
    englishWord: string, 
    category?: string
  ): Promise<IFlashcard> {
    const newFlashcard = new Flashcard({
      spanishWord,
      englishWord,
      category,
    });

    await newFlashcard.save();
    return newFlashcard;
  }

  /**
   * Get flashcards with pagination
   * @param options - Pagination options
   * @returns Paginated flashcards result
   */
  async getFlashcardsWithPagination(
    options: PaginationOptions
  ): Promise<PaginatedFlashcardsResult> {
    const flashcards = await Flashcard.find()
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    const totalFlashcards = await Flashcard.countDocuments();
    const totalPages = Math.ceil(totalFlashcards / options.limit);

    return {
      flashcards,
      pagination: {
        currentPage: options.page,
        totalPages,
        totalFlashcards,
      },
    };
  }

  /**
   * Get flashcards that need more practice (percentageCorrect < 50%)
   * @param category - Filter by category, or "All" for all categories
   * @returns Array of flashcards that need practice
   */
  async getFlashcardsNeedingPractice(category: string): Promise<IFlashcard[]> {
    const query: FlashcardQuery = {
      percentageCorrect: { $lt: 0.5 },
    };

    // If category is not "All", add the category to the query
    if (category !== "All") {
      query.category = category;
    }

    const flashcards = await Flashcard.find(query);
    return flashcards;
  }

  /**
   * Process CSV file and create flashcards
   * @param csvFilePath - Path to the CSV file
   */
  async processCSVUpload(csvFilePath: string): Promise<void> {
    await createFlashcardsFromCSV(csvFilePath);
  }

  /**
   * Check if the error is a Mongoose CastError
   * @param error - Error to check
   * @returns Boolean indicating if it's a CastError
   */
  isMongooseCastError(error: unknown): boolean {
    return error instanceof mongoose.Error.CastError;
  }
}

// Export a singleton instance
export const flashcardService = new FlashcardService();
