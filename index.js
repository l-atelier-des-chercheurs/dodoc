// if contentDir has not been defined by electron, we'll take __dirname as default
if( global.contentDir === undefined)
  global.contentDir = __dirname;
console.log('Will store contents in: ' + contentDir);

require('./server.js')();
