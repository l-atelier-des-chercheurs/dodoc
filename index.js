var dodoc  = require('./public/dodoc.js');
var path = require('path');

global.userDirname = path.join(__dirname, dodoc.userDirname);
console.log('Will store contents in: ' + global.userDirname);

require('./server.js')();
