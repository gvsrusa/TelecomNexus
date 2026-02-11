import baseConfig from '@telecom-nexus/config/eslint/base';

export default [
  ...baseConfig,
  {
    files: ['**/__generated__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Scripts are Node.js CLI tools — allow console and CommonJS
  {
    files: ['scripts/**/*.{js,ts}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  // Server entry points legitimately log to stdout
  {
    files: ['apps/gateway/src/index.ts', 'apps/services/*/src/index.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  // Cassandra client connection logging
  {
    files: ['apps/services/*/src/cassandra/client.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];
