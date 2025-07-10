module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/_tests_/setup.ts'],
  testTimeout: 30000,
  // Removed maxWorkers: 1 since in-memory databases don't have concurrency issues
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
