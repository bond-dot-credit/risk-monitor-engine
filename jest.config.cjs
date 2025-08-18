module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
  collectCoverage: true,
  coverageDirectory: 'test-results/coverage',
  coverageReporters: ['text', 'lcov'],
  reporters: [
    'default',
    [ 'jest-junit', { outputDirectory: 'test-results', outputName: 'junit.xml' } ]
  ]
};
