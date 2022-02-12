export default {
  testMatch: ['**/test/**/*.spec.ts'],
  roots: ['./test'],
  coveragePathIgnorePatterns: ['test/*'],
  reporters: ['default', ['jest-summary-reporter', { failuresOnly: true }], ['jest-html-reporters', {}]],
  verbose: true,
  maxWorkers: '100%',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testEnvironment: 'node',
  preset: 'ts-jest',
  slowTestThreshold: 1.5 * 1000,
  testTimeout: 10 * 1000,
  setupFilesAfterEnv: ['jest-extended/all']
};
