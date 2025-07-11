# Testing Guide

The Flashcard API includes a comprehensive test suite built with Jest, Supertest, and MongoDB Memory Server. This guide covers the testing architecture, best practices, and how to run and write tests.

## Overview

The testing system provides:
- **In-Memory Database**: Fast, isolated test execution using MongoDB Memory Server
- **Test Factories**: Consistent test data generation and management
- **Integration Testing**: Full API endpoint testing with Supertest
- **Unit Testing**: Service and controller layer testing
- **Error Testing**: Comprehensive error scenario coverage
- **Type Safety**: Full TypeScript support in tests

## Test Architecture

### Test Structure
```
_tests_/
├── constants/              # Test error messages and constants
│   └── testErrorMessages.ts
├── factories/              # Test data factories and helpers
│   ├── flashcardFactory.ts
│   ├── testHelpers.ts
│   ├── factories.test.ts
│   └── README.md
├── helpers/                # Test utilities
│   └── testDatabase.ts
├── setup.ts               # Global test setup
├── flashcardController.test.ts    # Controller integration tests
├── flashcardService.test.ts       # Service unit tests
├── flashcardDto.test.ts          # DTO validation tests
├── flashcardFavorite.test.ts     # Favorite functionality tests
└── flashcardDeduplication.test.ts # Deduplication tests
```

### Key Components

#### 1. In-Memory Database Setup
The test suite uses MongoDB Memory Server for fast, isolated testing:

```typescript
// _tests_/helpers/testDatabase.ts
export class TestDatabase {
  static async connect(): Promise<void> {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }
  
  static async disconnect(): Promise<void> {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer?.stop();
  }
}
```

#### 2. Test Factories
Centralized test data creation with sensible defaults:

```typescript
// _tests_/factories/flashcardFactory.ts
export class FlashcardDataFactory {
  static create(overrides?: Partial<CreateFlashcardDto>): CreateFlashcardDto {
    return {
      spanishWord: 'hola',
      englishWord: 'hello',
      category: 'greetings',
      ...overrides
    };
  }
  
  static createNeedsPractice(): CreateFlashcardDto {
    return this.create({
      spanishWord: 'difícil',
      englishWord: 'difficult'
    });
  }
}
```

#### 3. Test Assertions
Consistent assertion helpers for common patterns:

```typescript
export class FlashcardAssertionHelpers {
  static assertValidationError(response: any, fieldName?: string): void {
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    if (fieldName) {
      expect(response.body.message).toContain(fieldName);
    }
  }
  
  static assertFlashcardCreated(response: any, expectedData: any): void {
    expect(response.statusCode).toBe(201);
    expect(response.body.spanishWord).toBe(expectedData.spanishWord);
    expect(response.body.englishWord).toBe(expectedData.englishWord);
  }
}
```

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npx jest flashcardController.test.ts

# Run tests in watch mode
npx jest --watch

# Run tests with verbose output
npx jest --verbose
```

### Test Configuration
The Jest configuration in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/_tests_/setup.ts'],
  testMatch: ['**/_tests_/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts'
  ]
};
```

## Test Categories

### 1. Integration Tests
Test complete API endpoints with real HTTP requests:

```typescript
describe('Flashcard Controller Integration', () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  });

  afterAll(async () => {
    await TestDatabase.disconnect();
  });

  beforeEach(async () => {
    await TestDatabase.clearDatabase();
  });

  it('should create a new flashcard', async () => {
    const flashcardData = FlashcardDataFactory.create();
    
    const response = await request(app)
      .post(ApiUrlBuilder.add())
      .send(flashcardData);
    
    FlashcardAssertionHelpers.assertFlashcardCreated(response, flashcardData);
  });
});
```

### 2. Unit Tests
Test individual service methods and business logic:

```typescript
describe('FlashcardService', () => {
  it('should update flashcard stats correctly', async () => {
    const mockFlashcard = MockFlashcardFactory.create();
    const updateDto = { id: 'test-id', isCorrect: true };
    
    const result = await flashcardService.updateFlashcardStats(updateDto);
    
    expect(result.percentageCorrect).toBeGreaterThan(0);
    expect(result.timesSeen).toBe(1);
  });
});
```

### 3. Error Testing
Comprehensive error scenario coverage:

```typescript
describe('Error Handling', () => {
  it('should return validation error for missing required fields', async () => {
    const response = await request(app)
      .post(ApiUrlBuilder.add())
      .send({});
    
    TestAssertions.assertValidationError(response, 'englishWord');
  });

  it('should return not found error for invalid ID', async () => {
    const invalidId = TestDatabaseHelpers.generateInvalidObjectId();
    
    const response = await request(app)
      .put(ApiUrlBuilder.update(invalidId))
      .send({ isCorrect: true });
    
    TestAssertions.assertNotFound(response);
  });
});
```

### 4. Feature-Specific Tests
Tests for specific functionality like favorites and deduplication:

```typescript
describe('Favorite Functionality', () => {
  it('should mark flashcard as favorite', async () => {
    const flashcard = await createTestFlashcard();
    
    const response = await request(app)
      .put(ApiUrlBuilder.favorite(flashcard._id))
      .send({ favorite: true });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.favorite).toBe(true);
  });
});
```

## Test Data Management

### Using Factories
Always use factories instead of hardcoding test data:

```typescript
// ❌ Don't do this
const testData = {
  spanishWord: 'hola',
  englishWord: 'hello',
  category: 'greetings'
};

// ✅ Do this instead
const testData = FlashcardDataFactory.create({
  category: 'greetings'  // Only override what's specific to your test
});
```

### Database Lifecycle
Proper database setup and cleanup:

```typescript
describe('Test Suite', () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  });

  afterAll(async () => {
    await TestDatabase.clearDatabase();
    await TestDatabase.disconnect();
  });

  beforeEach(async () => {
    await TestDatabase.clearDatabase();  // Clean slate for each test
  });
});
```

## Best Practices

### 1. Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names that explain the expected behavior
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Test Independence
- Each test should be independent and not rely on other tests
- Use `beforeEach` to ensure clean state
- Don't share mutable state between tests

### 3. Error Testing
- Test both success and failure scenarios
- Use centralized error messages in test assertions
- Test edge cases and boundary conditions

### 4. Factory Usage
- Use factories for consistent test data
- Override only the properties relevant to your specific test
- Keep factory methods focused and single-purpose

### 5. Assertion Helpers
- Use assertion helpers for common patterns
- Make assertions specific and meaningful
- Include helpful error messages in custom assertions

## Writing New Tests

### 1. Integration Test Template
```typescript
describe('New Feature', () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  });

  afterAll(async () => {
    await TestDatabase.disconnect();
  });

  beforeEach(async () => {
    await TestDatabase.clearDatabase();
  });

  describe('POST /new-endpoint', () => {
    it('should handle successful case', async () => {
      // Arrange
      const testData = FlashcardDataFactory.create();
      
      // Act
      const response = await request(app)
        .post('/api/flashcards/new-endpoint')
        .send(testData);
      
      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(expectedResult);
    });

    it('should handle error case', async () => {
      // Test error scenarios
    });
  });
});
```

### 2. Unit Test Template
```typescript
describe('ServiceMethod', () => {
  it('should perform expected operation', async () => {
    // Arrange
    const mockData = MockFlashcardFactory.create();
    const inputDto = { /* test input */ };
    
    // Act
    const result = await service.methodUnderTest(inputDto);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.property).toBe(expectedValue);
  });
});
```

## Test Coverage

The test suite aims for high coverage across:
- **Controllers**: All endpoints and error scenarios
- **Services**: Business logic and data operations
- **DTOs**: Validation and mapping
- **Error Handling**: All error types and messages
- **Features**: Complete functionality testing

### Coverage Reports
```bash
# Generate coverage report
npm test -- --coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## Debugging Tests

### Common Issues
1. **Database Connection**: Ensure MongoDB Memory Server is properly set up
2. **Async Operations**: Use proper async/await patterns
3. **Test Isolation**: Clear database between tests
4. **Error Messages**: Use centralized error messages in assertions

### Debugging Tips
```typescript
// Add debug logging
console.log('Test data:', testData);
console.log('Response:', response.body);

// Use Jest's debug mode
npx jest --detectOpenHandles --forceExit

// Run single test for focused debugging
npx jest --testNamePattern="specific test name"
```

## Continuous Integration

The test suite is designed to run in CI/CD environments:
- No external dependencies (uses in-memory database)
- Fast execution (parallel test running)
- Comprehensive coverage reporting
- Clear failure messages

For more information about specific test utilities, see the [Test Factories Documentation](_tests_/factories/README.md).
