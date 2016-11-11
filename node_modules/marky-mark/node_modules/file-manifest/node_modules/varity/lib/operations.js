var _ = require('underscore'),
    extend = require('config-extend');

module.exports = {
  optional: function(arg, context) {
    this.args = this.args || [];
    if (_(arg).isDefined() && !this.thingOrDefault([this.args[0]], context.types)) {
      this.args.unshift(arg);
      return undefined;
    } else {
      return arg;
    }
  },
  populate: function(arg, context) {
    return arg || _.clone(this.options.defaults[context.types[0]]);
  },
  nonEmpty: function(arg, context) {
    return _(arg).isEmpty() ? _.clone(this.options.defaults[context.types[0]]) : arg;
  },
  required: function(arg, context) {
    if (_(arg).isDefined()) {
      return arg;
    } else {
      throw new Error('A parameter of type ' + context.types.join(' or ') + ' is required.');
    }
  },
  extend: function(arg, context) {
    var actualType = _(arg).stringify();
    if (this.options.extend[actualType]) {
      switch (actualType) {
      case 'Object':
        return extend(_(this.options.extend.Object).clone(), arg);
      case 'Array':
        return arg.concat(this.options.extend.Array);
      case 'String':
        return arg + ' ' + this.options.extend.String;
      case 'Function':
        return _.compose(arg, this.options.extend.Function);
      default:
        return arg;
      }
    } else {
      return arg;
    }
  }
};
