# In-Memory Database Testing Setup

## Overview

The test suite has been converted from using a local MongoDB database to using an in-memory database via `mongodb-memory-server`. This provides several benefits:

- **No external dependencies**: Tests don't require a local MongoDB instance to be running
- **Faster execution**: In-memory databases are faster than disk-based databases
- **Isolation**: Each test suite gets its own clean database instance
- **Portability**: Tests can run on any machine without database setup

## Changes Made

### 1. Dependencies Added
- `mongodb-memory-server`: Provides in-memory MongoDB instances for testing

### 2. TestDatabase Helper Updated
- `_tests_/helpers/testDatabase.ts` now uses `MongoMemoryServer` instead of connecting to `process.env.MONGO_URI`
- Each test suite gets its own isolated in-memory database instance
- Database instances are automatically cleaned up after tests complete

### 3. Jest Configuration Optimized
- Removed `maxWorkers: 1` constraint since in-memory databases don't have concurrency issues
- Tests can now run in parallel for better performance

### 4. Environment Variables
- Tests no longer depend on `MONGO_URI` environment variable
- The in-memory database connection string is generated automatically

## How It Works

1. **Test Startup**: When `TestDatabase.connect()` is called, a new `MongoMemoryServer` instance is created
2. **Database Connection**: Mongoose connects to the in-memory database using the generated URI
3. **Test Execution**: Tests run against the isolated in-memory database
4. **Cleanup**: After tests complete, both the Mongoose connection and the in-memory server are properly closed

## Usage

The API remains the same for test files:

```typescript
beforeAll(async () => {
  await TestDatabase.connect();
});

afterAll(async () => {
  await TestDatabase.clearDatabase();
  await TestDatabase.disconnect();
});

beforeEach(async () => {
  await TestDatabase.clearDatabase();
});
```

## Benefits

- **Reliability**: No dependency on external database state
- **Speed**: Faster test execution
- **Simplicity**: No need to set up or maintain test databases
- **CI/CD Friendly**: Tests run consistently in any environment
- **Parallel Execution**: Tests can run concurrently without conflicts

## Running Tests

Simply run the tests as before:

```bash
npm test
```

No additional setup or configuration is required.
