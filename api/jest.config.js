module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['index.js'],
  coverageReporters: ['html', 'text'],
  reporters: [
    'default',
    ['jest-html-reporter', { outputPath: 'test-report.html', pageTitle: 'Finca M&M API Tests' }]
  ],
};
