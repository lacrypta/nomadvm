module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/test/helpers.js'],
  coveragePathIgnorePatterns: ['\\.test\\.js'],
  coverageDirectory: '<rootDir>/dist/.coverage/meta',
  coverageProvider: 'babel',
  logHeapUsage: true,
  passWithNoTests: true,
  randomize: true,
  resetModules: true,
  restoreMocks: false,
  rootDir: '..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/helpers.test.js'],
  verbose: true,
  maxWorkers: 1,
};