'use strict';
module.exports = function (val, opts) {
	opts = opts || {};

	var base64 = new Buffer(JSON.stringify(val)).toString('base64');
	var contents = 'sourceMappingURL=data:application/json;base64,' + base64;

	if (opts.type === 'css') {
		return '/*# ' + contents + ' */';
	}

	return '//# ' + contents;
};
