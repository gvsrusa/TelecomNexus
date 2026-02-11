import baseConfig from '@telecom-nexus/config/eslint/base';

export default [
  ...baseConfig,
  {
    files: ['**/__generated__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
