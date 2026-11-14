import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  prettier,
  {
    languageOptions: { globals: globals.browser },
    rules: { 'vue/multi-word-component-names': 'off', 'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }] },
  },
];
