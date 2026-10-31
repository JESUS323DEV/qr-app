import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

/* Comprobaciones del código (npm run lint). Solo las que atrapan fallos de verdad: nombres sin declarar, usados antes de declararse o sin usar,
   hooks mal puestos y listas sin key. No manda sobre el estilo (sangría, comillas...): eso queda como esté. */
export default [
  { ignores: ['dist', 'node_modules', 'gestion', 'referencias', 'supabase/functions', '.claude'] },
  // Los comentarios eslint-disable de antes (de react-hooks/exhaustive-deps, que aquí no se usa) se dejan como están
  { linterOptions: { reportUnusedDisableDirectives: 'off' } },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-key': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'no-use-before-define': ['error', { functions: false, classes: false, variables: false }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['scripts/**/*.js', 'vite.config.js', 'eslint.config.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node },
  },
]
