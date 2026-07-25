import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules', 'public/firebase-messaging-sw.js'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // La app carga sus datos con el patron clasico de efecto + fetch
      // (`setLoading(true)` antes de la peticion). Migrar a un data layer con
      // cache (React Query o similar) es una decision de arquitectura
      // pendiente, no deuda a corregir archivo por archivo: se deja como aviso
      // para no bloquear el pipeline mientras tanto.
      'react-hooks/set-state-in-effect': 'warn',

      // El proyecto no usa PropTypes: el contrato de cada componente se
      // documenta con JSDoc en los modulos donde aporta valor.
      'react/prop-types': 'off',

      // Los `catch {}` vacios del codigo son deliberados (limpiezas
      // best-effort); se exige al menos que no oculten la variable.
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]
