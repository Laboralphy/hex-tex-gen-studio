import prettier from 'eslint-config-prettier';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

/**
 * The configuration of the raycaster-386 map editor, so that components move from one
 * project to the other unchanged. `prettier` must stay last.
 */
export default tseslint.config(
    { ignores: ['**/dist/**', '**/node_modules/**'] },
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.vue'],
        languageOptions: { parserOptions: { parser: tseslint.parser } },
    },
    prettier,
    {
        rules: {
            curly: 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },
    {
        files: ['tests/**'],
        rules: { '@typescript-eslint/no-explicit-any': 'off' },
    }
);
