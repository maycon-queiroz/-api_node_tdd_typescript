/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
	preset: '@shelf/jest-mongodb',
	// collectCoverage: true,
	coverageDirectory: 'coverage',
	testEnvironment: 'node',
	collectCoverageFrom: ['**/src/**/*.js', '!**/src/main/**'],
	coverageProvider: 'v8',
	verbose: true
};
