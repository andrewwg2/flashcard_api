module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/_tests_/setup.ts'],
  testTimeout: 30000,
  maxWorkers: 1, // Run tests sequentially to avoid database conflicts
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
