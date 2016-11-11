var photograb = require('photograb');


function VideoRecorder(el, opts) {
    opts || (opts = {});
    this.el = el;
    this.fps = opts.fps || 10;
    this.reset();
}

VideoRecorder.prototype.record = function (duration, doneCallback) {
    var delay = 1000 / this.fps;
    var pics = [];
    var self = this;
    var framesWeShouldCapture = duration && Math.floor(this.fps * (duration / 1000));
    var el = this.el;
    var start = Date.now();
    this.running = true;

    function step() {
        var timePassed = Date.now() - start;
        if (!self.halt && !duration || timePassed < duration) {
            setTimeout(step, delay);
            pics.push(photograb(el));
        } else {
            self.data = self.data.concat(pics);
            self.runningTime += timePassed;
            self.halt = false;
            self.running = false;
            if (doneCallback) {
                console.log('framesWeShouldCapture', framesWeShouldCapture, pics.length);
                if (pics.length < framesWeShouldCapture) {
                    doneCallback(new Error('DroppedFrames'), pics);
                } else {
                    doneCallback(null, pics);
                }
            }
        }
    }

    step();
};

VideoRecorder.prototype.stop = function () {
    if (this.running) this.halt = true;
};

VideoRecorder.prototype.reset = function () {
    this.data = [];
    this.running = false;
    this.halt = false;
    this.runningTime = 0;
};


module.exports = VideoRecorder;
