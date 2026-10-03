export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['**/.dist/**', '**/.vite/**', '**/dist/**', '**/node_modules/**'],
  rules: {
    'alpha-value-notation': null,
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'custom-property-empty-line-before': null,
    'media-feature-range-notation': null,
    'value-keyword-case': null,
  },
};
