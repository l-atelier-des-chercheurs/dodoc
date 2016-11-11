(function(e){if("function"==typeof bootstrap)bootstrap("videorecorder",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeVideoRecorder=e}else"undefined"!=typeof window?window.VideoRecorder=e():global.VideoRecorder=e()})(function(){var define,ses,bootstrap,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function (element, opts) {
    opts || (opts = {});
    var type = opts.type || 'image/png';
    var ratio = element.videoWidth / element.videoHeight;
    var canvas = window.canvas = document.createElement('canvas');
    var context = window.context = canvas.getContext('2d');
    var height, width;
    if (opts.width && opts.height) {
        height = opts.width;
        width = opts.width;
    } else if (opts.width) {
        width = opts.width;
        height = width / ratio;
    } else if (opts.height) {
        height = opts.height;
        width = height * ratio;
    } else {
        height = element.videoHeight;
        width = element.videoWidth;
    }
    canvas.height = height;
    canvas.width = width;
    context.drawImage(element, 0, 0, width, height);
    return canvas.toDataURL(type);
};

},{}],2:[function(require,module,exports){
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

},{"photograb":1}]},{},[2])
(2)
});
;