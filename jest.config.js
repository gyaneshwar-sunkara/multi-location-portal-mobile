/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|react-native-mmkv|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context|zustand))',
  ],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/\\.expo/'],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'stores/**/*.ts',
    'hooks/**/*.ts',
    'components/ui/**/*.tsx',
    '!**/*.d.ts',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 35,
      branches: 35,
      functions: 35,
      lines: 35,
    },
  },
};

module.exports = config;
