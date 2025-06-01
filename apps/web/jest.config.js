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

    // Path aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@kairos/utils$': '<rootDir>/../../packages/utils/src',
    '^@kairos/types$': '<rootDir>/../../packages/types/src',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/main.tsx', '!src/vite-env.d.ts'],
}
