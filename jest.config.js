// jest.config.js (root level)
module.exports = {
  projects: ['<rootDir>/apps/web/jest.config.js', '<rootDir>/apps/api/jest.config.js'],
  collectCoverageFrom: [
    'apps/*/src/**/*.{ts,tsx}',
    'packages/*/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageReporters: ['html', 'text', 'lcov'],
}
