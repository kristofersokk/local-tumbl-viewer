/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
	printWidth: 80,
	semi: true,
	singleQuote: true,
	jsxSingleQuote: false,
	trailingComma: 'es5',
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: 'avoid',
	endOfLine: 'auto',
	importOrder: ['^react', '^@?\\w', '^\\./', '^\\../', '^\\./.*', '^\\../.*'],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	plugins: ['prettier-plugin-tailwindcss'],
};
