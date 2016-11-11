
var flags = require('./flags');
flags.exitOnError = false;

exports.testGlobalFlagsObject = function(test) {
  flags.defineString('one', '111');
  flags.defineString('two', '222');
  test.deepEqual(global.GLOBAL_FLAGS, flags.FLAGS);
  test.done();
};

exports.testStringFlagParsing = function(test) {
  flags.reset();
  flags.defineString('one', '111');
  flags.defineString('two', '222');
  flags.defineString('three', '333');
  flags.parse(['--one', '--two=dos']);
  
  test.strictEqual(null, flags.get('one'));
  test.strictEqual('dos', flags.get('two'));
  test.strictEqual('333', flags.get('three'));
  
  test.ok(flags.FLAGS.one.isSet === true);
  test.ok(flags.FLAGS.two.isSet === true);
  test.ok(flags.FLAGS.three.isSet === false);
  
  test.done();
};

exports.testStringFlagParsingWithSpaces = function(test) {
  flags.reset();
  flags.defineString('one', '111');
  flags.defineString('two', '222');
  flags.parse(['--one', 'aaa', '--two', 'bbb']);
  test.strictEqual('aaa', flags.get('one'));
  test.strictEqual('bbb', flags.get('two'));
  test.done();
};

exports.testIntegerFlagParsing = function(test) {
  flags.reset();
  flags.defineInteger('one', 11);
  flags.defineInteger('two', 22);
  flags.parse(['--one=111']);
  test.strictEqual(111, flags.get('one'));
  test.strictEqual(22, flags.get('two'));
  test.done();
};

exports.testIntegerFlagParsing_stringInput = function(test) {
  flags.reset();
  flags.defineInteger('one', 11);
  test.throws(function() {
    flags.parse(['--one=xxx']);
  });
  test.done();
};

exports.testIntegerFlagParsing_nonIntInput = function(test) {
  flags.reset();
  flags.defineInteger('one', 11);
  test.throws(function() {
    flags.parse(['--one=1.123']);
  });
  test.done();
};

exports.testNumberFlagParsing = function(test) {
  flags.reset();
  flags.defineNumber('one', 1.1);
  flags.defineNumber('two', 2.2);
  flags.parse(['--one=1.234']);
  test.strictEqual(1.234, flags.get('one'));
  test.strictEqual(2.2, flags.get('two'));
  test.done();
};

exports.testNumberFlagParsing_stringInput = function(test) {
  flags.reset();
  flags.defineNumber('one', 1.1);
  test.throws(function() {
    flags.parse(['--one=xxx']);
  });
  test.done();
};

exports.testBooleanFlagParsing = function(test) {
  flags.reset();
  flags.defineBoolean('a');
  flags.defineBoolean('b', false);
  flags.defineBoolean('c').setDefault(false);
  flags.defineBoolean('d', false);
  flags.defineBoolean('e').setDefault(true);
  flags.defineBoolean('f', true);
  flags.defineBoolean('g', true);
  flags.defineBoolean('h', true);
  flags.defineBoolean('i');
  flags.parse(['--a', '--b=true', '--c=t', '--d=1', '--noe', '--f=false',
               '--g=0', '--h=f']);
  test.strictEqual(true, flags.get('a'));
  test.strictEqual(true, flags.get('b'));
  test.strictEqual(true, flags.get('c'));
  test.strictEqual(true, flags.get('d'));
  test.strictEqual(false, flags.get('e'));
  test.strictEqual(false, flags.get('f'));
  test.strictEqual(false, flags.get('g'));
  test.strictEqual(false, flags.get('h'));
  test.strictEqual(false, flags.get('i'));
  test.done();
};

exports.testBooleanFlagParsing_badInput = function(test) {
  flags.reset();
  flags.defineBoolean('a', false);
  test.throws(function() {
    flags.parse(['--a=xxx']);
  });
  test.done();
};

exports.testStringListFlagParsing = function(test) {
  flags.reset();
  flags.defineStringList('one', []);
  flags.parse(['--one=a,b,c,d']);
  test.deepEqual(['a', 'b', 'c', 'd'], flags.get('one'));
  test.done();
};

exports.testMultiStringFlagParsing = function(test) {
  flags.reset();
  flags.defineMultiString('one', []);
  flags.parse(['--one=a', '--one=b', '--one=c', '--one=d']);
  test.deepEqual(['a', 'b', 'c', 'd'], flags.get('one'));
  test.done();
};

exports.testUnrecognizedFlags = function(test) {
  flags.reset();
  test.throws(function() {
    flags.parse(['--one']);  
  });
  test.done();
};

exports.testDuplicateFlags = function(test) {
  flags.reset();
  flags.defineString('one', '');
  test.throws(function() {
    flags.defineString('one', '');
  });
  test.done();
};

exports.testThrowIfDefineAfterParse = function(test) {
  flags.reset();
  flags.parse([]);
  test.throws(function() {
    flags.defineString('one', '');
  });
  test.done();
};

exports.testValidators = function(test) {
  function setUp() {
    flags.reset();
    flags.defineString('one').setValidator(function(inp) {
      if (inp.substr(0, 3) != 'xxx') throw Error('Bad Input');
    });
  }
  setUp();
  flags.parse(['--one=xxxyyy']);
  setUp();
  test.throws(function() {
    flags.parse(['--one=yyyxxx']);
  });
  test.done();
};

exports.testBreakFlag = function(test) {
  flags.reset();
  flags.defineString('one', '');
  flags.defineString('two', '');
  var rv = flags.parse(['--one=2', '--two=3', '--', 'something', 'else']);
  test.deepEqual(['something', 'else'], rv);
  test.done();
};

exports.testBreakFlag_nothingElse = function(test) {
  flags.reset();
  flags.defineString('one', '');
  flags.defineString('two', '');
  var rv = flags.parse(['--one=2', '--two=3', '--']);
  test.deepEqual([], rv);
  test.done();
};

exports.testReturnValue = function(test) {
  flags.reset();
  flags.defineString('one', '');
  flags.defineString('two', '');
  var rv = flags.parse(['--one=2', '--two=3']);
  test.deepEqual([], rv);
  test.done();
};

exports.testIsSet = function(test) {
    flags.reset();
    flags.defineInteger('one', 1);
    flags.defineInteger('two', 2);
    flags.parse(['--one=11']);
    test.strictEqual(true, flags.isSet('one'));
    test.strictEqual(false, flags.isSet('two'));
    test.done();
};
