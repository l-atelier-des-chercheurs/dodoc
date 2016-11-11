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
