module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'jest', 'prettier', 'unused-imports', 'no-floating-promise'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:prettier/recommended'
  ],
  env: {
    node: true,
    'jest/globals': true
  },
  settings: {
    jest: {
      version: 27
    }
  },
  rules: {
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/semi': 1,
    '@typescript-eslint/quotes': ['error', 'single'],
    'no-floating-promise/no-floating-promise': 2,
    'no-return-await': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'prettier/prettier': [
      'warn',
      {
        printWidth: 120,
        tabWidth: 2,
        tabs: false,
        semi: true,
        singleQuote: true,
        quoteProps: 'as-needed',
        trailingComma: 'none',
        bracketSpacing: true,
        arrowParens: 'avoid'
      }
    ]
  },
  ignorePatterns: ['dist', 'node_modules', '**/generated']
};
