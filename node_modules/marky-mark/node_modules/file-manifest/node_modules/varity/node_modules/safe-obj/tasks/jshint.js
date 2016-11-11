module.exports = {
  options: {
    reporter: require('jshint-stylish'),
    eqeqeq: true,
    es3: true,
    indent: 2,
    newcap: true,
    quotmark: 'single'
  },
  all: ['lib/**/*.js']
};
