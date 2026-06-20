import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/**
 * Flat ESLint config for the ArrowERA CMS monorepo.
 *
 * Scope: TypeScript/TSX source across packages, apps, plugins and scripts.
 * The ruleset is intentionally pragmatic — it surfaces genuine correctness
 * problems (no-undef via TS, unsafe constructs) while tolerating the
 * stylistic patterns already present in the codebase (explicit `any`,
 * intentionally unused args) so that `pnpm lint` reflects real defects only.
 */
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.astro/**',
      '**/*.d.ts',
      'pnpm-lock.yaml',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      // The codebase deliberately uses `any` in several adapter/boundary layers.
      '@typescript-eslint/no-explicit-any': 'off',
      // Unused vars are reported as warnings and ignore leading-underscore args.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      // Empty constructors / interface-extension blocks are used as markers.
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      // Intentional patterns in adapter/boundary code: lazy `require()` for
      // optional drivers, `Function` typed mock maps, and `this` aliasing.
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
    },
  },
);
