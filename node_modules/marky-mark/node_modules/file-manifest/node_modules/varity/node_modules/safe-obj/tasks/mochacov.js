module.exports = {
  lcov: {
    options: {
      reporter: 'mocha-lcov-reporter',
      instrument: true,
      ui: 'mocha-given',
      require: 'coffee-script/register',
      output: 'coverage/coverage.lcov'
    },
    src: ['test/**/*.coffee', '!test/browser/**/*.*']
  },
  html: {
    options: {
      reporter: 'html-cov',
      ui: 'mocha-given',
      require: 'coffee-script/register',
      output: 'coverage/coverage.html'
    },
    src: ['test/**/*.coffee', '!test/browser/**/*.*']
  }
};
