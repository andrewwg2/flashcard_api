import Flashcard, { IFlashcard } from '../models/flashcardModel';
import mongoose from 'mongoose';
import { createFlashcardsFromCSV } from '../CSVUpload';
import { 
  FlashcardDto, 
  CreateFlashcardDto, 
  UpdateFlashcardStatsDto, 
  FlashcardQueryDto, 
  PaginatedFlashcardsResultDto,
  FlashcardDtoMapper,
  ToggleFavoriteDto
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
   * Toggle the favorite status of a flashcard
   * @param dto - The toggle favorite DTO containing ID and favorite flag
   * @returns Updated flashcard DTO or null if not found
   */
  async toggleFavorite(dto: ToggleFavoriteDto): Promise<FlashcardDto | null> {
    const flashcard = await Flashcard.findById(dto.id);
    
    if (!flashcard) {
      return null;
    }

    flashcard.favorite = dto.favorite;
    await flashcard.save();
    
    return FlashcardDtoMapper.toDto(flashcard);
  }

  /**
   * Remove duplicate flashcards based on spanishWord
   * Keeps records with percentageCorrect data, removes those without
   * @returns Object containing deletion summary
   */
  async deDuplicateFlashcards(): Promise<{ deletedCount: number; duplicateGroups: number; remainingCount: number }> {
    // Find duplicates based on spanishWord
    const duplicates = await Flashcard.aggregate([
      {
        $group: {
          _id: '$spanishWord',
          duplicates: { $push: '$$ROOT' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    let totalDeleted = 0;
    const duplicateGroups = duplicates.length;

    // Process each group of duplicates
    for (const duplicateGroup of duplicates) {
      const recordsToDelete: string[] = [];

      // Separate records with and without percentageCorrect data
      for (const record of duplicateGroup.duplicates) {
        // Keep records that have meaningful percentageCorrect data (> 0 or have been seen)
        // Delete records that are essentially empty (percentageCorrect = 0 and timesSeen = 0)
        if (record.percentageCorrect === 0 && record.timesSeen === 0) {
          recordsToDelete.push(record._id);
        }
      }

      // If all records are empty, keep the first one
      if (recordsToDelete.length === duplicateGroup.duplicates.length) {
        recordsToDelete.pop(); // Remove one from deletion list to keep at least one record
      }

      // Delete the identified records
      for (const recordId of recordsToDelete) {
        await Flashcard.findByIdAndDelete(recordId);
        totalDeleted++;
      }
    }

    // Get remaining count
    const remainingCount = await Flashcard.countDocuments();

    return {
      deletedCount: totalDeleted,
      duplicateGroups,
      remainingCount
    };
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
