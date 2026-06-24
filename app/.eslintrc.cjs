module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh', 'boundaries'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    'boundaries/elements': [
      { type: 'ui', pattern: 'src/components/**' },
      { type: 'ui', pattern: 'src/pages/**' },
      { type: 'application', pattern: 'src/hooks/**' },
      { type: 'domain', pattern: 'src/utils/**' },
      { type: 'cross-cutting', pattern: 'src/observability/**' },
      { type: 'cross-cutting', pattern: 'src/error-boundary/**' },
    ],
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    // Round 7 加的依赖方向规则（仅 warn）
    'boundaries/element-types': ['warn', {
      default: 'disallow',
      rules: [
        { from: 'ui', allow: ['application', 'cross-cutting', 'domain'] },
        { from: 'application', allow: ['domain', 'cross-cutting'] },
        { from: 'domain', allow: ['cross-cutting'] },
        { from: 'cross-cutting', allow: ['cross-cutting'] },
      ],
    }],
    // 历史遗留：放宽以不阻断当前 PR
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'warn',
    'no-control-regex': 'warn',
  },
  ignorePatterns: ['dist', 'node_modules', 'coverage', 'playwright-report', 'test-results', '*.cjs'],
};
