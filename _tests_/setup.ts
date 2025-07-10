import dotenv from 'dotenv';

// Load environment variables for tests
dotenv.config();

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
if (process.env.SUPPRESS_TEST_LOGS === 'true') {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}
