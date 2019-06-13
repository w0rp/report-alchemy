const path = require('path')

module.exports = {
  name: 'report-alchemy',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '\\.spec\\.ts$',
  reporters: ['jest-dot-reporter'],
}

// Enable HTML reports if an environment variable is set.
if (process.env.HTML_REPORT === '1') {
  module.exports.reporters.push([
    'jest-html-reporter',
    {
      pageTitle: 'Test Report',
      outputPath: path.resolve(__dirname, '.report', 'jest.html'),
    },
  ])
}

// Enable coverage if an environment variable is set for it.
// This makes it easy to run tests in editors without running coverage reports.
if (process.env.COVERAGE === '1') {
  Object.assign(module.exports, {
    collectCoverage: true,
    collectCoverageFrom: [
      'src/**/*.ts',
    ],
    coverageDirectory: path.resolve(__dirname, '.report', 'coverage'),
    coverageReporters: ['text-summary', 'html'],
  })
}
