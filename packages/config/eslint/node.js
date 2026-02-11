/** @type {import('eslint').Linter.Config[]} */
import base from './base.js';

export default [
  ...base,
  {
    files: ['**/*.{ts,js,mjs,cjs}'],
    rules: {
      'no-console': 'off',
    },
  },
];
