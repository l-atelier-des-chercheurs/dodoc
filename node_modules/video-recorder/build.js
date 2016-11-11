var bundle = require('browserify')();
var fs = require('fs');


bundle.add('./video-recorder');
bundle.bundle({standalone: 'VideoRecorder'}).pipe(fs.createWriteStream('video-recorder.bundle.js'));
