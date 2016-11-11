(function(e){if("function"==typeof bootstrap)bootstrap("photograb",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makePhotograb=e}else"undefined"!=typeof window?window.photograb=e():global.photograb=e()})(function(){var define,ses,bootstrap,module,exports;
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
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

},{}]},{},[1])(1)
});
;