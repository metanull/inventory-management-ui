import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'
import configPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/scripts/**', '**/.env*'],
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...tseslint.configs.recommended,

  {
    name: 'app/vue-typescript',
    files: ['**/*.vue'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: parserVue,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-v-html': 'warn',
    },
  },

  {
    name: 'app/ts-rules',
    files: ['**/*.{ts,mts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  {
    name: 'app/test-rules',
    files: ['**/__tests__/**/*', '**/*.test.*'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.vitest, 
      },
    },
  },

  configPrettier,
]