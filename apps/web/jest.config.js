// apps/web/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    // Handle CSS and SCSS imports (the key fix!)
    '\\.(css|scss|sass)$': 'identity-obj-proxy',

    // Handle SVG imports with ?raw suffix (Vite syntax)
    '\\.svg\\?raw$': 'jest-transform-stub',

    // Handle regular SVG imports
    '\\.svg$': 'jest-transform-stub',

    // Mock firebase lib to avoid import.meta issues
    '^.*/lib/firebase$': '<rootDir>/src/lib/__mocks__/firebase.ts',

    // Mock API config to avoid import.meta issues
    '^.*/services/api/config$': '<rootDir>/src/services/api/__mocks__/config.ts',

    // Path aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@kairos/utils$': '<rootDir>/../../packages/utils/src',
    '^@kairos/types$': '<rootDir>/../../packages/types/src',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['src/utils/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/*.test.{ts,tsx}'],
  // coverageProvider: 'v8',
}
