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
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverageFrom: ['**/*.ts', '!**/node_modules/**', '!**/dist/**'],
  passWithNoTests: true,
}
