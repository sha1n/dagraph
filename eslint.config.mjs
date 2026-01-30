import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', '**/generated', 'jest-html-reporters-attach', 'coverage']
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    plugins: {
      prettier: prettierPlugin,
      jest: jestPlugin
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/semi': 'warn',
      '@typescript-eslint/quotes': ['error', 'single'],
      '@typescript-eslint/no-floating-promises': 'error',
      'no-return-await': 'error',

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
    }
  },
  {
    files: ['test/**/*.spec.ts', 'test/**/*.ts'],
    ...jestPlugin.configs['flat/recommended'],
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error'
    }
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked
  },
  eslintConfigPrettier
);
