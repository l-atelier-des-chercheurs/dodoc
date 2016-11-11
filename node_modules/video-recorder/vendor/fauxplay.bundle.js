(function(e){if("function"==typeof bootstrap)bootstrap("fauxplay",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeFauxplay=e}else"undefined"!=typeof window?window.fauxplay=e():global.fauxplay=e()})(function(){var define,ses,bootstrap,module,exports;
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
module.exports = function (srcArray, img, opts) {
    opts || (opts = {});
    var loop = !(opts.loop === false);
    var duration = opts.duration || (srcArray.length * 100);
    var delay = duration / srcArray.length;
    var length = srcArray.length;
    var requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;
    var floor = Math.floor;
    var start;

    function step(timestamp) {
        if (!start) start = timestamp;
        var diff = floor(timestamp - start);
        var frame = floor(length * (diff / duration));
        var item = srcArray[frame];
        if (item && diff < duration) {
            requestAnimationFrame(step);
            img.src = item;
        } else {
            if (loop) {
                start = timestamp;
                requestAnimationFrame(step);
            }
        }
    }

    requestAnimationFrame(step);
};

},{}]},{},[1])(1)
});
;