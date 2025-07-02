import { FlashcardDtoMapper, FlashcardDto } from '../src/dto/flashcardDto';

describe('FlashcardDtoMapper', () => {
  describe('toDto', () => {
    it('should convert a Mongoose document to a DTO', () => {
      // Arrange
      const mockFlashcard = {
        _id: '60d21b4667d0d8992e610c85',
        spanishWord: 'perro',
        englishWord: 'dog',
        dateLastSeen: new Date('2023-01-01'),
        timesSeen: 5,
        percentageCorrect: 0.8,
        category: 'Animals'
      };

      // Act
      const dto = FlashcardDtoMapper.toDto(mockFlashcard);

      // Assert
      expect(dto).toEqual({
        id: '60d21b4667d0d8992e610c85',
        spanishWord: 'perro',
        englishWord: 'dog',
        dateLastSeen: mockFlashcard.dateLastSeen,
        timesSeen: 5,
        percentageCorrect: 0.8,
        category: 'Animals'
      });
    });
  });

  describe('toDtoList', () => {
    it('should convert an array of Mongoose documents to DTOs', () => {
      // Arrange
      const mockFlashcards = [
        {
          _id: '60d21b4667d0d8992e610c85',
          spanishWord: 'perro',
          englishWord: 'dog',
          timesSeen: 5,
          percentageCorrect: 0.8,
          category: 'Animals'
        },
        {
          _id: '60d21b4667d0d8992e610c86',
          spanishWord: 'gato',
          englishWord: 'cat',
          timesSeen: 3,
          percentageCorrect: 0.67,
          category: 'Animals'
        }
      ];

      // Act
      const dtos = FlashcardDtoMapper.toDtoList(mockFlashcards);

      // Assert
      expect(dtos).toHaveLength(2);
      expect(dtos[0].id).toBe('60d21b4667d0d8992e610c85');
      expect(dtos[1].id).toBe('60d21b4667d0d8992e610c86');
    });
  });

  describe('toPaginatedResultDto', () => {
    it('should convert a paginated result to a DTO', () => {
      // Arrange
      const mockResult = {
        flashcards: [
          {
            _id: '60d21b4667d0d8992e610c85',
            spanishWord: 'perro',
            englishWord: 'dog',
            timesSeen: 5,
            percentageCorrect: 0.8
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 5,
          totalFlashcards: 50
        }
      };

      // Act
      const resultDto = FlashcardDtoMapper.toPaginatedResultDto(mockResult);

      // Assert
      expect(resultDto.flashcards).toHaveLength(1);
      expect(resultDto.flashcards[0].id).toBe('60d21b4667d0d8992e610c85');
      expect(resultDto.pagination).toEqual(mockResult.pagination);
    });
  });
});
