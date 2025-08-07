module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'complexity': ['error', 10],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    'max-lines-per-function': ['error', 50],
    'max-lines': ['error', { 'max': 300, 'skipBlankLines': true, 'skipComments': true }]
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  }
};