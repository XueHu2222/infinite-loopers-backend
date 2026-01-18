import fs from 'fs';
import path from 'path';

export default [
  {
    root: true,
    ignores: ['node_modules', 'dist'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      import: require('eslint-plugin-import'),
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': 'warn',
      'import/no-unresolved': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    overrides: [
      {
        files: ['*.ts', '*.tsx'],
        rules: {
          '@typescript-eslint/explicit-function-return-type': 'off',
        },
      },
      {
        files: ['*.js'],
        rules: {
        },
      },
    ],
  },
];
