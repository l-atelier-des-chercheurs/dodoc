var dodoc  = require('./public/dodoc.js');
var path = require('path');

// if contentDir has not been defined by electron, we'll take __dirname as default
if( global.userDir === undefined)
  global.userDir = path.join(__dirname, dodoc.userDir);
console.log('Will store contents in: ' + global.userDir);

require('./server.js')();
