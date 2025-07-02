import Flashcard, { IFlashcard } from '../models/flashcardModel';
import mongoose from 'mongoose';
import { createFlashcardsFromCSV } from '../CSVUpload';
import { 
  FlashcardDto, 
  CreateFlashcardDto, 
  UpdateFlashcardStatsDto, 
  FlashcardQueryDto, 
  PaginatedFlashcardsResultDto,
  FlashcardDtoMapper
} from '../dto/flashcardDto';

interface FlashcardQuery {
  percentageCorrect?: { $lt: number };
  category?: string;
}

export class FlashcardService {
  /**
   * Update flashcard statistics based on whether the answer was correct
   * @param dto - The update DTO containing ID and isCorrect flag
   * @returns Updated flashcard DTO or null if not found
   */
  async updateFlashcardStats(dto: UpdateFlashcardStatsDto): Promise<FlashcardDto | null> {
    const flashcard = await Flashcard.findById(dto.id);
    
    if (!flashcard) {
      return null;
    }

    flashcard.updateStats(dto.isCorrect);
    await flashcard.save();
    
    return FlashcardDtoMapper.toDto(flashcard);
  }

  /**
   * Create a new flashcard
   * @param dto - The create flashcard DTO
   * @returns Created flashcard DTO
   */
  async createFlashcard(dto: CreateFlashcardDto): Promise<FlashcardDto> {
    const newFlashcard = new Flashcard({
      spanishWord: dto.spanishWord,
      englishWord: dto.englishWord,
      category: dto.category,
    });

    await newFlashcard.save();
    return FlashcardDtoMapper.toDto(newFlashcard);
  }

  /**
   * Get flashcards with pagination
   * @param queryDto - Query parameters for pagination
   * @returns Paginated flashcards result DTO
   */
  async getFlashcardsWithPagination(
    queryDto: FlashcardQueryDto
  ): Promise<PaginatedFlashcardsResultDto> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    
    const flashcards = await Flashcard.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalFlashcards = await Flashcard.countDocuments();
    const totalPages = Math.ceil(totalFlashcards / limit);

    const result = {
      flashcards,
      pagination: {
        currentPage: page,
        totalPages,
        totalFlashcards,
      },
    };

    return FlashcardDtoMapper.toPaginatedResultDto(result);
  }

  /**
   * Get flashcards that need more practice (percentageCorrect < 50%)
   * @param category - Filter by category, or "All" for all categories
   * @returns Array of flashcard DTOs that need practice
   */
  async getFlashcardsNeedingPractice(category: string): Promise<FlashcardDto[]> {
    const query: FlashcardQuery = {
      percentageCorrect: { $lt: 0.5 },
    };

    // If category is not "All", add the category to the query
    if (category !== "All") {
      query.category = category;
    }

    const flashcards = await Flashcard.find(query);
    return FlashcardDtoMapper.toDtoList(flashcards);
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
