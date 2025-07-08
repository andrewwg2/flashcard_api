## Flashcard Favorite Functionality Test

This document demonstrates the new favorite functionality added to the Flashcard API.

### New Features Added:

1. **Favorite Attribute**: Each flashcard now has a `favorite` boolean field (default: false)
2. **Toggle Favorite Endpoint**: PUT `/api/flashcards/favorite/{id}` to set/unset favorite status
3. **Updated DTOs**: All flashcard DTOs now include the favorite field
4. **Updated API Documentation**: New endpoint and updated Flashcard schema

### API Endpoint:

**PUT** `/api/flashcards/favorite/{id}`

**Request Body:**
```json
{
  "favorite": true
}
```

**Response:**
```json
{
  "id": "60d5f484f1b2c72d9c8b4567",
  "spanishWord": "hola",
  "englishWord": "hello",
  "dateLastSeen": "2023-06-15T10:30:00.000Z",
  "timesSeen": 5,
  "percentageCorrect": 0.8,
  "category": "Greetings",
  "favorite": true
}
```

### Usage Examples:

1. **Mark a flashcard as favorite:**
   ```bash
   curl -X PUT http://localhost:5000/api/flashcards/favorite/60d5f484f1b2c72d9c8b4567 \
     -H "Content-Type: application/json" \
     -d '{"favorite": true}'
   ```

2. **Remove a flashcard from favorites:**
   ```bash
   curl -X PUT http://localhost:5000/api/flashcards/favorite/60d5f484f1b2c72d9c8b4567 \
     -H "Content-Type: application/json" \
     -d '{"favorite": false}'
   ```

### Database Schema Changes:

**Before:**
```typescript
interface IFlashcard extends Document {
  spanishWord: string;
  englishWord: string;
  dateLastSeen?: Date;
  timesSeen: number;
  percentageCorrect: number;
  category?: string;
}
```

**After:**
```typescript
interface IFlashcard extends Document {
  spanishWord: string;
  englishWord: string;
  dateLastSeen?: Date;
  timesSeen: number;
  percentageCorrect: number;
  category?: string;
  favorite?: boolean;  // New field
}
```

### Service Method:

```typescript
async toggleFavorite(dto: ToggleFavoriteDto): Promise<FlashcardDto | null> {
  const flashcard = await Flashcard.findById(dto.id);
  
  if (!flashcard) {
    return null;
  }

  flashcard.favorite = dto.favorite;
  await flashcard.save();
  
  return FlashcardDtoMapper.toDto(flashcard);
}
```

### Validation:

The API validates that the `favorite` field is a boolean value. Invalid requests return appropriate error messages.

### Error Handling:

- 200: Success - returns the updated flashcard
- 400: Validation error (if favorite is not a boolean)
- 404: Flashcard not found
- 500: Server error

### Backward Compatibility:

The favorite field is optional and defaults to false, so existing code will continue to work without modification. The field will be included in all API responses for consistency.
