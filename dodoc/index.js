var path = require('path');
var dodoc  = require('./dodoc.js');

global.userDirname = path.join(__dirname, dodoc.userDirname);
console.log('Will store contents in: ' + global.userDirname);

require('./server.js')();
