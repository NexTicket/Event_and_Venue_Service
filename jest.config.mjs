export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true
    }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^firebase-admin/(.*)$': '<rootDir>/tests/__mocks__/firebase-admin/$1',
    '^.*generated/prisma.*$': '<rootDir>/__mocks__/generated/prisma/index.js'
  },
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/src/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/generated/**'
  ],
<<<<<<< HEAD
=======
  setupFilesAfterEnv: ['<rootDir>/tests/setup-clean.ts'],
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
  clearMocks: true,
  resetMocks: true
};
