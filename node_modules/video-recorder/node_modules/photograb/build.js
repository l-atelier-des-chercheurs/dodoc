var bundle = require('browserify')();
var fs = require('fs');


bundle.add('./photograb');
bundle.bundle({standalone: 'photograb'}).pipe(fs.createWriteStream('photograb.bundle.js'));
