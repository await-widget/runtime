export default [
	{
		files: ['types/*.d.ts'],
		prettier: true,
		rules: {
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/triple-slash-reference': 'off',
			'unicorn/require-module-specifiers': 'off',
		},
	},
];
