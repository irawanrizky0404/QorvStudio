import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * Flat config, using eslint-config-next's own flat exports.
 * FlatCompat + `extends` blows up on ESLint 9 with a circular-structure error
 * when it tries to serialise the React plugin — the native exports avoid it.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    /* `scripts/` adalah perkakas baris perintah, bukan kode yang dikirim ke
     * pengguna: mencetak progres ke konsol memang tugasnya. */
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'tests/**', 'scripts/**'],
  },
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default eslintConfig;
