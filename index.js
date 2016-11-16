var dodoc  = require('./public/dodoc.js');
var path = require('path');

// if contentDirname has not been defined, we'll take __dirname/userDirname as default
if( global.userDirname === undefined)
  global.userDirname = path.join(__dirname, dodoc.userDirname);
console.log('Will store contents in: ' + global.userDirname);

require('./server.js')();
