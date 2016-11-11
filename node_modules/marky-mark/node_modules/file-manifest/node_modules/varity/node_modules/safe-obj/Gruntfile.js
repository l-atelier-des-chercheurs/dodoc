var tm = require('task-master');

module.exports = function(grunt) {
  tm(grunt);
  grunt.registerTask('mocha', ['mochaTest:test']);
  grunt.registerTask('default', ['jshint:all', 'mocha', 'testem:ci:browser']);
  grunt.registerTask('coverage', ['mochacov:html']);
  grunt.registerTask('ci', ['jshint:all', 'testem:ci:browser', 'mocha', 'travis']);
  grunt.registerTask('browser', ['testem:run:browser']);
  grunt.registerTask('prepublish', ['uglify:dist', 'copy:safe']);
};
