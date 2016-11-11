var extend = require('config-extend'),
    _ = require('underscore'),
    standardOptions = require('./opts');

_.mixin(require('safe-obj'));

var Varity = module.exports = function Varity () {
  this.options = extend({}, standardOptions, Varity._globalOptions, Varity._instanceOptions);
  Varity._instanceOptions = {};
  this.letters = _(this.options.letters).keys().join('');
  this.symbols = _(this.options.symbols).keys().join('');
  this.expectations = [];
  this.buildExpressions();
  _(this).bindAll('buildExpectations');
};

Varity._globalOptions = {};
Varity._instanceOptions = {};

Varity.configure = function(opts) {
  Varity._globalOptions = opts;
};

Varity.reset = function() {
  Varity._globalOptions = {};
  Varity._instanceOptions = {};
};

Varity.extend = function(path, val) {
  _(Varity._instanceOptions).expand(path, val);
};

Varity.prototype.buildExpressions = function() {
  var letters = '[' + this.letters + ']';
  var symbols = '[' + this.symbols + ']*';
  var array = '\\[' + letters + '\\]';
  var or = '\\|';
  this.options.expressions = [
    symbols + letters + or + array,
    symbols + array + or + array,
    symbols + array + or + letters,
    symbols + '\\[' + letters + or + letters + '\\]',
    symbols + array,
    symbols + letters + or + letters,
    symbols + letters
  ];
};

Varity.prototype.wrap = function() {
  var self = this;
  if (arguments.length < 1) throw new Error('No function passed to varity');
  var args = [].slice.call(arguments);
  var fn = args.pop();
  if (!_(fn).isFunction()) throw new Error('Last argument is not a function');
  _(args).each(self.buildExpectations);
  return function() {
    return fn.apply(fn, self.buildParams([].slice.call(arguments)));
  };
};

Varity.prototype.buildExpectations = function(expectation) {
  var self = this;
  switch (_(expectation || {}).stringify()) {
  case 'Function':
    self.buildEvaluator({
      symbols: [],
      types: [/^function ([^(]+)/.exec(expectation)[1]]
    });
    break;
  case 'Array':
    _(expectation).each(function(exp) {
      self.buildEvaluator({
        symbols: [],
        types: [_(exp).capitalize()]
      });
    });
    break;
  case 'String':
    self.tokenize(expectation);
    break;
  default:
    throw new Error('Arguments to varity must be of type function, array, or string');
  }
};

Varity.prototype.tokenize = function(str) {
  var matches = str.match(new RegExp(this.options.expressions.join('|'), 'g'));
  this.parse(matches || []);
};

Varity.prototype.parse = function(matches) {
  var self = this;
  _(matches).each(function(match) {
    var context = {
      symbols: self.mapSymbols(match),
      types: self.expandTypes(match).replace(new RegExp('[' + self.symbols + ']', 'g'), '')
    };
    self.parseSpecialSymbols(context);
    self.buildEvaluator(context);
  });
};

Varity.prototype.mapSymbols = function(match) {
  return match.match(new RegExp('[' + this.symbols + ']', 'g')) || [];
};

Varity.prototype.expandTypes = function(match) {
  var self = this;
  return match.replace(new RegExp('[' + this.letters + ']', 'g'), function(m) {
    return self.options.letters[m];
  });
};

Varity.prototype.buildEvaluator = function(context) {
  var self = this;
  this.expectations.push(function() {
    var res = _(self.getOperations(context)).reduce(function(memo, operation) {
      memo = operation.call(self, memo, context);
      return memo;
    }, self.thingOrDefault(self.args, context.types));
    return res;
  });
};

Varity.prototype.getOperations = function(context) {
  var self = this;
  return _(context.symbols).reduce(function(memo, symbol) {
    if (self.options.symbols[symbol]) {
      memo.push(self.options.symbols[symbol]);
    }
    return memo;
  }, []).concat(self.wrapResult);
};

Varity.prototype.thingOrDefault = function(args, expected) {
  if (~expected.indexOf(_(args[0]).stringify())) {
    return args.shift();
  } else {
    if (typeof this.options.populate === 'boolean' || ~this.options.populate.indexOf(expected[0])) {
      return this.options.defaults[expected[0]];
    } else {
      return undefined;
    }
  }
};

Varity.prototype.parseSpecialSymbols = function(context) {
  if (/\[.*\]\|\[.*\]/.test(context.types)) {
    context.wrapType = 'array or array';
  } else if (/\[.*\|.*\]/.test(context.types)) {
    context.wrapType = 'or inside array';
  } else if (/\[.*\]\|.*/.test(context.types)) {
    context.wrapType = 'array or type';
  } else if (/.*\|\[.*\]/.test(context.types)) {
    context.wrapType = 'type or array';
  } else if (/.*\|.*/.test(context.types)) {
    context.wrapType = 'type or type';
  } else if (/\[.*\]/.test(context.types)) {
    context.wrapType = 'array';
  } else {
    context.wrapType = '';
  }
  context.types = context.types.replace(/[\[\]]/g, '').split('|');
};

Varity.prototype.wrapResult = function(arg, context) {
  switch(context.wrapType) {
  case 'array or array':
  case 'or inside array':
  case 'array':
    return ~context.types.indexOf(_(arg).stringify()) ? [arg] : arg;
  case 'array or type':
    return _(arg).stringify() === context.types[0] ? [arg] : arg;
  case 'type or array':
    return _(arg).stringify() === context.types[1] ? [arg] : arg;
  default:
    return arg;
  }
};

Varity.prototype.buildParams = function(args) {
  var self = this;
  self.args = args;
  return _(self.expectations).reduce(function(memo, expectation) {
    memo.push(expectation());
    return memo;
  }, []).concat(args);
};
