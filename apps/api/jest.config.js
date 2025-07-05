// apps/api/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@kairos/utils$': '<rootDir>/../../packages/utils/src',
    '^@kairos/types$': '<rootDir>/../../packages/types/src',
    '^@kairos/database$': '<rootDir>/../../packages/database/src',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/test/**', '!**/node_modules/**', '!**/dist/**'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
}
