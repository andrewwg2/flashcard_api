// Data Transfer Objects for Flashcard operations

export interface FlashcardDto {
  id?: string;
  spanishWord: string;
  englishWord: string;
  dateLastSeen?: Date;
  timesSeen: number;
  percentageCorrect: number;
  category?: string;
  favorite?: boolean;
}

export interface CreateFlashcardDto {
  spanishWord: string;
  englishWord: string;
  category?: string;
}

export interface UpdateFlashcardStatsDto {
  id: string;
  isCorrect: boolean;
}

export interface ToggleFavoriteDto {
  id: string;
  favorite: boolean;
}

export interface FlashcardQueryDto {
  page?: number;
  limit?: number;
  category?: string;
}

export interface PaginatedFlashcardsResultDto {
  flashcards: FlashcardDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalFlashcards: number;
  };
}

// Mapper functions to convert between DTOs and domain models
export class FlashcardDtoMapper {
  static toDto(flashcard: any): FlashcardDto {
    return {
      id: flashcard._id?.toString(),
      spanishWord: flashcard.spanishWord,
      englishWord: flashcard.englishWord,
      dateLastSeen: flashcard.dateLastSeen,
      timesSeen: flashcard.timesSeen,
      percentageCorrect: flashcard.percentageCorrect,
      category: flashcard.category,
      favorite: flashcard.favorite
    };
  }

  static toDtoList(flashcards: any[]): FlashcardDto[] {
    return flashcards.map(this.toDto);
  }

  static toPaginatedResultDto(result: any): PaginatedFlashcardsResultDto {
    return {
      flashcards: this.toDtoList(result.flashcards),
      pagination: result.pagination
    };
  }
}
