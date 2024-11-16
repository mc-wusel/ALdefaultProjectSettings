import globals from 'globals';
import pluginJs from '@eslint/js';
import pkg from '@typescript-eslint/eslint-plugin';  // Importiere das Paket als Standard

/** @type {import('eslint').Linter.Config} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': pkg,  // Korrekte Definition des Plugins als Objekt
    },
    rules: {
      // Beispiel für eine manuell eingefügte Regel aus TypeScript
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      // Weitere spezifische Regeln können hier hinzugefügt werden
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      // JavaScript-spezifische Regeln
    },
  },
  pluginJs.configs.recommended,
  {
    files: ['**/*.ts'],  // Nur TypeScript-Dateien
    plugins: {
      '@typescript-eslint': pkg,  // Korrekte Plugin-Definition
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-assertions': 'warn',
    },
  },
];
