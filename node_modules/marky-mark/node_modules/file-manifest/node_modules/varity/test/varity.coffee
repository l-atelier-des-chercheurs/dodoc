describe 'Varity', ->
  Given -> @subject = sandbox '../lib/varity',
    'underscore': _

  Given -> @standardOpts = require '../lib/opts'
  Given -> @varity = new @subject()

  describe '#new', ->
    Given -> sinon.stub(@subject.prototype, 'buildExpressions')
    Given -> @subject._globalOptions =
      foo: 'bar'
    When -> @varity = new @subject()
    Then -> expect(@varity.expectations).to.deep.equal []
    And -> expect(@subject._instanceOptions).to.deep.equal {}
    And -> expect(@varity.letters).to.deep.equal _(@standardOpts.letters).keys().join('')
    And -> expect(@varity.symbols).to.deep.equal _(@standardOpts.symbols).keys().join('')
    And -> expect(@varity.options.foo).to.equal 'bar'
    And -> expect(@varity.buildExpressions).to.have.been.called

  describe '.extend', ->
    When -> @subject.extend('letters.Q', 'Quux')
    Then -> expect(@subject._instanceOptions).to.deep.equal
      letters:
        Q: 'Quux'

  describe '.configure', ->
    Given -> @opts =
      foo: 'bar'
    When -> @subject.configure(@opts)
    Then -> expect(@subject._globalOptions).to.deep.equal
      foo: 'bar'

  describe '.reset', ->
    Given -> @subject._globalOptions =
      foo: 'bar'
    When -> @subject.reset()
    Then -> expect(@subject._globalOptions).to.deep.equal {}

  describe '.buildExpressions', ->
    Given -> @varity.letters = 'abc'
    Given -> @varity.symbols = '123'
    When -> @varity.buildExpressions()
    Then -> expect(@varity.options.expressions).to.deep.equal [
      '[123]*[abc]\\|\\[[abc]\\]'
      '[123]*\\[[abc]\\]\\|\\[[abc]\\]'
      '[123]*\\[[abc]\\]\\|[abc]'
      '[123]*\\[[abc]\\|[abc]\\]'
      '[123]*\\[[abc]\\]'
      '[123]*[abc]\\|[abc]'
      '[123]*[abc]'
    ]

  describe '#wrap', ->
    Given -> @fn = sinon.stub().returns('foo')

    context 'with no args', ->
      Then -> expect(@varity.wrap).to.throw('No function passed to varity')

    context 'with no function last', ->
      Then -> expect(@varity.wrap).with('string').to.throw('Last argument is not a function')

    context 'returns the function wrapped', ->
      Given -> @fn = sinon.spy()
      Given -> sinon.stub(@varity, 'buildExpectations')
      Given -> sinon.stub(@varity, 'buildParams')
      When -> @wrapper = @varity.wrap(@fn)
      And -> @wrapper()
      Then -> expect(@fn).called

  describe '#buildExpecations', ->
    afterEach ->
      @varity.buildEvaluator.restore()

    Given -> sinon.stub(@varity, 'buildEvaluator')

    context 'function', ->
      context 'built in type', ->
        When -> @varity.buildExpectations(Array)
        Then -> expect(@varity.buildEvaluator).to.have.been.calledWith
          symbols: []
          types: ['Array']

      context 'custom type', ->
        Given -> @Foo = class Foo
        When -> @varity.buildExpectations(@Foo)
        Then -> expect(@varity.buildEvaluator).to.have.been.calledWith
          symbols: []
          types: ['Foo']

    context 'array', ->
      When -> @varity.buildExpectations(['String', 'Object'])
      Then -> expect(@varity.buildEvaluator).to.have.been.calledWith
        symbols: []
        types: ['String']
      And -> expect(@varity.buildEvaluator).to.have.been.calledWith
        symbols: []
        types: ['Object']
      
    context 'string', ->
      Given -> sinon.stub(@varity, 'tokenize')
      When -> @varity.buildExpectations('abc')
      Then -> expect(@varity.tokenize).to.have.been.calledWith('abc')

    context 'other', ->
      Then -> expect(@varity.buildExpectations).with(foo: 'bar').to.throw('Arguments to varity must be of type function, array, or string')

  describe '#tokenize', ->
    afterEach ->
      @varity.parse.restore()

    Given -> sinon.stub(@varity, 'parse')

    context 'simple string', ->
      When -> @varity.tokenize('sao')
      Then -> expect(@varity.parse).to.have.been.calledWith ['s', 'a', 'o']

    context 'or', ->
      When -> @varity.tokenize('s|ao')
      Then -> expect(@varity.parse).to.have.been.calledWith ['s|a', 'o']

    context 'array', ->
      When -> @varity.tokenize('[s]o')
      Then -> expect(@varity.parse).to.have.been.calledWith ['[s]', 'o']

    context 'or inside array', ->
      When -> @varity.tokenize('[s|n]o')
      Then -> expect(@varity.parse).to.have.been.calledWith ['[s|n]', 'o']

    context 'array or letter', ->
      When -> @varity.tokenize('[s]|ao')
      Then -> expect(@varity.parse).to.have.been.calledWith ['[s]|a', 'o']

    context 'array or array', ->
      When -> @varity.tokenize('[s]|[n]a')
      Then -> expect(@varity.parse).to.have.been.calledWith ['[s]|[n]', 'a']

    context 'letter or array', ->
      When -> @varity.tokenize('a|[s]n')
      Then -> expect(@varity.parse).to.have.been.calledWith ['a|[s]', 'n']

    context 'no match', ->
      When -> @varity.tokenize('&')
      Then -> expect(@varity.parse).to.have.been.calledWith([])

  describe '#parse', ->
    afterEach ->
      @varity.buildEvaluator.restore()

    Given -> sinon.stub(@varity, 'buildEvaluator')
    When -> @varity.parse(['+a', '-s|a'])
    Then -> expect(@varity.buildEvaluator).to.have.been.calledWith
      symbols: ['+']
      types: ['Array']
      wrapType: ''
    And -> expect(@varity.buildEvaluator).to.have.been.calledWith
      symbols: ['-']
      types: ['String', 'Array']
      wrapType: 'type or type'

  describe '#expandTypes', ->
    When -> @res = @varity.expandTypes '*a|s[1]'
    Then -> expect(@res).to.equal '*Array|String[Number]'

  describe '#mapSymbols', ->
    When -> @res = @varity.mapSymbols '*-Array|String'
    Then -> expect(@res).to.deep.equal ['*', '-']

  describe '#buildEvaluator', ->
    afterEach ->
      @varity.thingOrDefault.restore()
      @varity.getOperations.restore()

    Given -> sinon.stub(@varity, 'thingOrDefault')
    Given -> sinon.stub(@varity, 'getOperations')
    Given -> @spy1 = sinon.stub()
    Given -> @spy2 = sinon.stub()
    Given -> @spy1.returns 'aha'
    Given -> @spy2.returns 'aha!'
    Given -> @varity.getOperations.returns [@spy1, @spy2]
    Given -> @context =
      symbols: ['+', '-']
      types: ['String', 'Function']
    When -> @varity.buildEvaluator @context
    Then -> expect(@varity.expectations.length).to.equal 1

    describe '~ evaluator', ->
      Given -> @varity.thingOrDefault.returns 'memo'
      Given -> @varity.args = ['a string', 'next']
      When -> @res = @varity.expectations[0]()
      Then -> expect(@varity.thingOrDefault).to.have.been.calledWith ['a string', 'next'], ['String', 'Function']
      And -> expect(@spy1).to.have.been.calledWith 'memo', @context
      And -> expect(@spy2).to.have.been.calledWith 'aha', @context
      And -> expect(@res).to.equal 'aha!'

  describe '#thingOrDefault', ->
    context 'matches', ->
      When -> @res = @varity.thingOrDefault ['foo'], ['String']
      Then -> expect(@res).to.equal 'foo'

    context 'does not match', ->
      When -> @res = @varity.thingOrDefault ['foo'], ['Number']
      Then -> expect(@res).to.not.be.defined()

    context 'does not match and has default', ->
      Given -> @varity.options.populate = ['Number']
      Given -> @varity.options.defaults.Number = 7
      When -> @res = @varity.thingOrDefault ['foo'], ['Number']
      Then -> expect(@res).to.equal 7

    context 'does not match and populate is "true"', ->
      Given -> @varity.options.populate = true
      Given -> @varity.options.defaults.Number = 3.4
      When -> @res = @varity.thingOrDefault ['foo'], ['Number']
      Then -> expect(@res).to.equal 3.4

  describe '#parseSpecialSymbols', ->
    context 'array', ->
      Given -> @context =
        types: '[String]'
      When -> @varity.parseSpecialSymbols @context
      Then -> expect(@context.wrapType).to.equal 'array'
      And -> expect(@context.types).to.deep.equal ['String']

    context 'type or type', ->
      Given -> @context =
        types: 'String|Array'
      When -> @varity.parseSpecialSymbols @context
      Then -> expect(@context.wrapType).to.equal 'type or type'
      And -> expect(@context.types).to.deep.equal ['String', 'Array']

    context 'type or array', ->
      Given -> @context =
        types: 'Array|[String]'
      When -> @varity.parseSpecialSymbols @context
      Then -> expect(@context.wrapType).to.equal 'type or array'
      And -> expect(@context.types).to.deep.equal ['Array', 'String']

    context 'array or array', ->
      Given -> @context =
        types: '[String]|[Number]'
      When -> @varity.parseSpecialSymbols @context
      Then -> expect(@context.wrapType).to.equal 'array or array'
      And -> expect(@context.types).to.deep.equal ['String', 'Number']

    context 'array or type', ->
      Given -> @context =
        types: '[String]|Number'
      When -> @varity.parseSpecialSymbols @context
      Then -> expect(@context.wrapType).to.equal 'array or type'
      And -> expect(@context.types).to.deep.equal ['String', 'Number']

    context 'or inside array', ->
      Given -> @context =
        types: '[String|Number]'
      When -> @varity.parseSpecialSymbols @context
      Then -> expect(@context.wrapType).to.equal 'or inside array'
      And -> expect(@context.types).to.deep.equal ['String', 'Number']
      
    context 'undefined', ->
      Given -> @context =
        types: 'String'
      When -> @varity.parseSpecialSymbols @context
      Then -> expect(@context.wrapType).to.equal ''
      And -> expect(@context.types).to.deep.equal ['String']

  describe '#wrapResult', ->
    context 'array or array', ->
      context 'matches first', ->
        When -> @res = @varity.wrapResult 'foo',
          types: ['String', 'Number']
          wrapType: 'array or array'
        Then -> expect(@res).to.deep.equal ['foo']

      context 'matches second', ->
        When -> @res = @varity.wrapResult 2,
          types: ['String', 'Number']
          wrapType: 'array or array'
        Then -> expect(@res).to.deep.equal [2]

      context 'undefined', ->
        When -> @res = @varity.wrapResult undefined,
          types: ['String', 'Number']
          wrapType: 'array or array'
        Then -> expect(@res).to.equal undefined

    context 'or inside array', ->
      context 'matches first', ->
        When -> @res = @varity.wrapResult 'foo',
          types: ['String', 'Number']
          wrapType: 'or inside array'
        Then -> expect(@res).to.deep.equal ['foo']

      context 'matches second', ->
        When -> @res = @varity.wrapResult 2,
          types: ['String', 'Number']
          wrapType: 'or inside array'
        Then -> expect(@res).to.deep.equal [2]

    context 'array', ->
      When -> @res = @varity.wrapResult 'foo',
        types: ['String']
        wrapType: 'array'
      Then -> expect(@res).to.deep.equal ['foo']

    context 'array or type', ->
      context 'matches first', ->
        When -> @res = @varity.wrapResult 'foo',
          types: ['String', 'Number']
          wrapType: 'array or type'
        Then -> expect(@res).to.deep.equal ['foo']

      context 'matches second', ->
        When -> @res = @varity.wrapResult 2,
          types: ['String', 'Number']
          wrapType: 'array or type'
        Then -> expect(@res).to.equal 2

    context 'type or array', ->
      context 'matches first', ->
        When -> @res = @varity.wrapResult 'foo',
          types: ['String', 'Number']
          wrapType: 'type or array'
        Then -> expect(@res).to.equal 'foo'

      context 'matches second', ->
        When -> @res = @varity.wrapResult 2,
          types: ['String', 'Number']
          wrapType: 'type or array'
        Then -> expect(@res).to.deep.equal [2]

    context 'type or type', ->
      context 'matches first', ->
        When -> @res = @varity.wrapResult 'foo',
          types: ['String', 'Number']
          wrapType: 'type or type'
        Then -> expect(@res).to.equal 'foo'

      context 'matches second', ->
        When -> @res = @varity.wrapResult 2,
          types: ['String', 'Number']
          wrapType: 'type or type'
        Then -> expect(@res).to.equal 2

    context 'no wrapType', ->
      When -> @res = @varity.wrapResult 'foo',
        types: ['String']
        wrapType: ''
      Then -> expect(@res).to.equal 'foo'

  describe '#getOperations', ->
    Given -> @varity.wrapResult = 'wrap'
    context 'with no symbols', ->
      When -> @res = @varity.getOperations
        symbols: []
      Then -> expect(@res).to.deep.equal(['wrap'])

    context 'with symbols', ->
      Given -> @varity.options.symbols['+'] = 'plus'
      Given -> @varity.options.symbols['-'] = 'minus'
      When -> @res = @varity.getOperations
        symbols: ['+', '-']
      Then -> expect(@res).to.deep.equal ['plus', 'minus', 'wrap']

    context 'with user operations', ->
      Given -> @varity.options.symbols['~'] = 'tilde'
      Given -> @varity.options.symbols['+'] = 'plus'
      Given -> @varity.options.symbols['-'] = 'minus'
      Given -> @varity.options.symbols['#'] = 'hash'
      When -> @res = @varity.getOperations
        symbols: ['~', '+', '-', '#']
      Then -> expect(@res).to.deep.equal ['tilde', 'plus', 'minus', 'hash', 'wrap']

    context 'with non-existent operation', ->
      Given -> @varity.options.symbols['+'] = 'plus'
      When -> @res = @varity.getOperations
        symbols: ['@', '+']
      Then -> expect(@res).to.deep.equal ['plus', 'wrap']

  describe '#buildParams', ->
    Given -> @exp1 = ->
      @args.shift()
      return 'result 1'
    Given -> @exp2 = ->
      @args.shift()
      return 'result 2'
    Given -> @wrap1 = =>
      @exp1.call(@varity)
    Given -> @wrap2 = =>
      @exp2.call(@varity)
    Given -> @varity.expectations = [@wrap1, @wrap2]
    When -> @res = @varity.buildParams ['arg1', 'arg2']
    Then -> expect(@res).to.deep.equal ['result 1', 'result 2']
