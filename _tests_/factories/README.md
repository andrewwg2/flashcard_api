# Test Factories Documentation

This directory contains test factories and helpers to reduce code duplication and improve test maintainability.

## Overview

The test factories provide a consistent and maintainable way to:
- Create test data with sensible defaults
- Generate mock objects for testing
- Build API request payloads
- Assert common response patterns
- Generate test database IDs
- Handle pagination test scenarios

## Available Factories

### 1. FlashcardDataFactory

Creates flashcard data objects for testing.

```typescript
// Create a single flashcard with defaults
const flashcard = FlashcardDataFactory.create();

// Create with custom values
const customFlashcard = FlashcardDataFactory.create({
  spanishWord: 'Buenos días',
  category: 'Greetings'
});

// Create a flashcard that needs practice (low performance)
const needsPractice = FlashcardDataFactory.createNeedsPractice();

// Create a high-performance flashcard
const highPerformance = FlashcardDataFactory.createHighPerformance();

// Create multiple flashcards
const flashcards = FlashcardDataFactory.createMany(5);
```

### 2. MockFlashcardFactory

Creates mock flashcard instances with Jest functions for unit testing.

```typescript
// Create a mock flashcard with jest functions
const mockFlashcard = MockFlashcardFactory.create();

// Create with custom properties
const customMock = MockFlashcardFactory.create({
  _id: 'custom-id',
  percentageCorrect: 0.75
});

// Create a query builder mock
const queryBuilder = MockFlashcardFactory.createQueryBuilder(returnValue);
```

### 3. FlashcardRequestFactory

Creates request payloads for API testing.

```typescript
// Create a valid add request
const addRequest = FlashcardRequestFactory.createAddRequest();

// Create an update request
const updateRequest = FlashcardRequestFactory.createUpdateRequest(true);

// Create an invalid request (missing required fields)
const invalidRequest = FlashcardRequestFactory.createInvalidRequest();
```

### 4. FlashcardAssertionHelpers

Provides consistent assertion methods for common response patterns.

```typescript
// Assert validation error
FlashcardAssertionHelpers.assertValidationError(response, 'fieldName');

// Assert successful creation
FlashcardAssertionHelpers.assertFlashcardCreated(response, expectedData);

// Assert server error
FlashcardAssertionHelpers.assertServerError(response);

// Assert not found
FlashcardAssertionHelpers.assertNotFound(response);

// Assert bad request
FlashcardAssertionHelpers.assertBadRequest(response);
```

### 5. TestDatabaseHelpers

Utilities for database-related test operations.

```typescript
// Generate valid MongoDB ObjectId
const objectId = TestDatabaseHelpers.generateObjectId();

// Generate ObjectId as string
const objectIdStr = TestDatabaseHelpers.generateObjectIdString();

// Generate invalid ObjectId for error testing
const invalidId = TestDatabaseHelpers.generateInvalidObjectId();
```

### 6. PaginationTestHelpers

Helpers for pagination testing scenarios.

```typescript
// Create default pagination options
const defaultOptions = PaginationTestHelpers.createDefaultOptions();

// Create custom pagination options
const customOptions = PaginationTestHelpers.createOptions(2, 20);

// Create expected pagination response
const expected = PaginationTestHelpers.createExpectedPagination(1, 5, 100);
```

### 7. TestErrorFactory

Creates various error types for testing error handling.

```typescript
// Create Mongoose CastError
const castError = TestErrorFactory.createCastError();

// Create generic error
const error = TestErrorFactory.createGenericError('Custom message');

// Create internal server error
const serverError = TestErrorFactory.createInternalServerError();
```

### 8. ApiUrlBuilder

Builds API endpoint URLs consistently.

```typescript
// Build custom path
const url = ApiUrlBuilder.build('/custom-path');

// Build specific endpoints
const addUrl = ApiUrlBuilder.add();
const getAllUrl = ApiUrlBuilder.getAll(1, 10);
const updateUrl = ApiUrlBuilder.update('flashcard-id');
const needPracticeUrl = ApiUrlBuilder.needPractice('Greetings');
```

## Usage Examples

### Integration Test Example

```typescript
import {
  FlashcardDataFactory,
  FlashcardRequestFactory,
  FlashcardAssertionHelpers,
  ApiUrlBuilder,
} from './factories';

describe('Flashcard API', () => {
  it('should create a flashcard', async () => {
    const requestData = FlashcardRequestFactory.createAddRequest();
    
    const response = await request(app)
      .post(ApiUrlBuilder.add())
      .send(requestData);
    
    FlashcardAssertionHelpers.assertFlashcardCreated(response, requestData);
  });
});
```

### Unit Test Example

```typescript
import {
  MockFlashcardFactory,
  TestDatabaseHelpers,
} from './factories';

describe('FlashcardService', () => {
  it('should update flashcard stats', async () => {
    const testId = TestDatabaseHelpers.generateObjectIdString();
    const mockFlashcard = MockFlashcardFactory.create({ _id: testId });
    
    // ... test implementation
  });
});
```

## Benefits

1. **DRY Principle**: Reduces code duplication across tests
2. **Consistency**: Ensures consistent test data and assertions
3. **Maintainability**: Changes to test data structure only require updates in one place
4. **Readability**: Tests become more readable and focused on behavior
5. **Type Safety**: TypeScript support provides IDE assistance and type checking

## Best Practices

1. Use factories instead of hardcoding test data
2. Override only the properties relevant to your test
3. Use descriptive variable names when creating test data
4. Leverage assertion helpers for consistent error checking
5. Keep factories focused and single-purpose

## Contributing

When adding new test scenarios:
1. Check if existing factories can be extended
2. Create new factory methods for common patterns
3. Document new factory methods in this README
4. Ensure TypeScript types are properly defined
