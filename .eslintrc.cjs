module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['prettier', 'import'],
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/consistent-generic-constructors': ['error', 'constructor'],
		'@typescript-eslint/consistent-type-imports': [
			'error',
			{
				prefer: 'type-imports',
				disallowTypeAnnotations: true,
				fixStyle: 'inline-type-imports',
			},
		],
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ vars: 'all', args: 'after-used', ignoreRestSiblings: false },
		],
		curly: 'error',
		'no-console': 'off',
		'no-empty': ['error', { allowEmptyCatch: true }],
		'import/no-default-export': 'error',
		'padding-line-between-statements': [
			'error',
			{ blankLine: 'always', prev: 'import', next: '*' },
			{ blankLine: 'any', prev: 'import', next: 'import' },
		],
		'prettier/prettier': 'error'
	},
	ignorePatterns: ['dist', 'node_modules', '.eslintrc.js', 'jest.config.js', 'coverage', '.eslintrc.cjs'],
}
