describe 'acceptance', ->
  Given -> @v = require '../lib'
  Given -> @cb = sinon.spy()

  describe 'type syntax', ->
    context 'all types match', ->
      Given -> @fn = sinon.spy()
      Given -> @wrapped = @v Array, Function, @cb
      When -> @wrapped [1,2], @fn
      Then -> expect(@cb).to.have.been.calledWith [1,2], @fn

    context 'first type matches', ->
      Given -> @wrapped = @v Array, Function, @cb
      When -> @wrapped [1,2]
      Then -> expect(@cb).to.have.been.calledWith [1,2], undefined

    context 'second type matches', ->
      Given -> @fn = sinon.spy()
      Given -> @wrapped = @v Array, Function, @cb
      When -> @wrapped @fn
      Then -> expect(@cb).to.have.been.calledWith undefined, @fn

    context 'with a default', ->
      Given -> @v.populate 'Array', ['foo', 'bar']
      Given -> @fn = sinon.spy()
      Given -> @wrapped = @v Array, Function, @cb
      When -> @wrapped @fn
      Then -> expect(@cb).to.have.been.calledWith ['foo', 'bar'], @fn

    context 'with a custom type', ->
      Given -> @Foo = class Foo
      Given -> @wrapped = @v Array, @Foo, @cb
      Given -> @foo = new @Foo()
      When -> @wrapped [], @foo
      Then -> expect(@cb).to.have.been.calledWith [], @foo

    context 'custom type with a default', ->
      Given -> @Foo = class Foo
        constructor: (key, val) ->
          @[key] = val
      Given -> @v.populate 'Foo', new @Foo('foo', 'bar')
      Given -> @wrapped = @v @Foo, @cb
      When -> @wrapped()
      And -> @fooArg = @cb.getCall(0).args[0]
      Then -> expect(@fooArg.foo).to.equal 'bar'

  describe 'array syntax', ->
    context 'all types match', ->
      Given -> @fn = sinon.spy()
      Given -> @wrapped = @v ['array', 'function'], @cb
      When -> @wrapped [1,2], @fn
      Then -> expect(@cb).to.have.been.calledWith [1,2], @fn

    context 'first type matches', ->
      Given -> @wrapped = @v ['array', 'function'], @cb
      When -> @wrapped [1,2]
      Then -> expect(@cb).to.have.been.calledWith [1,2], undefined

    context 'second type matches', ->
      Given -> @fn = sinon.spy()
      Given -> @wrapped = @v ['array', 'function'], @cb
      When -> @wrapped @fn
      Then -> expect(@cb).to.have.been.calledWith undefined, @fn

    context 'with a default', ->
      Given -> @v.populate 'Array', ['foo', 'bar']
      Given -> @fn = sinon.spy()
      Given -> @wrapped = @v ['array', 'function'], @cb
      When -> @wrapped @fn
      Then -> expect(@cb).to.have.been.calledWith ['foo', 'bar'], @fn

    context 'with a custom type', ->
      Given -> @Foo = class Foo
      Given -> @wrapped = @v ['Array', 'Foo'], @cb
      Given -> @foo = new @Foo()
      When -> @wrapped [1], @foo
      Then -> expect(@cb).to.have.been.calledWith [1], @foo

  describe 'letter syntax', ->
    context 'all types match', ->
      Given -> @fn = sinon.spy()
      Given -> @wrapped = @v 'af', @cb
      When -> @wrapped [1,2], @fn
      Then -> expect(@cb).to.have.been.calledWith [1,2], @fn

    context 'first type matches', ->
      Given -> @wrapped = @v 'af', @cb
      When -> @wrapped [1,2]
      Then -> expect(@cb).to.have.been.calledWith [1,2], undefined

    context 'second type matches', ->
      Given -> @fn = sinon.spy()
      Given -> @wrapped = @v 'af', @cb
      When -> @wrapped @fn
      Then -> expect(@cb).to.have.been.calledWith undefined, @fn

    context 'with -', ->
      Given -> @wrapped = @v '-oo', @cb
      When -> @wrapped {}
      Then -> expect(@cb).to.have.been.calledWith undefined, {}

    context 'with +', ->
      Given -> @wrapped = @v '+a+o', @cb
      When -> @wrapped()
      Then -> expect(@cb).to.have.been.calledWith [], {}

    context 'called more than once with +', ->
      Given -> @wrapped = @v '+os', (@obj, foo) =>
        @obj.foo = @obj.foo || foo
      When -> @wrapped('bar')
      And -> @wrapped('baz')
      Then -> expect(@obj.foo).to.equal 'baz'

    context 'with _', ->
      Given -> @v.defaults 'Array', [1,2]
      Given -> @wrapped = @v '_as', @cb
      When -> @wrapped [], 'string'
      Then -> expect(@cb).to.have.been.calledWith [1,2], 'string'

    context 'with &', ->
      Given -> @v.extend 'Object', { foo: 'bar' }
      Given -> @v.extend 'Array', [3, 4]
      Given -> @v.extend 'String', 'world'
      Given -> @v.extend 'Function', (name) -> name.split('').reverse().join('')
      Given -> @wrapped = @v '&o&a&s&f', @cb
      When -> @wrapped { baz: 'quux' }, [1, 2], 'hello', (rev) -> rev.split('').join(' ')
      Then -> expect(@cb).to.have.been.calledWith
        foo: 'bar'
        baz: 'quux'
      , [1, 2, 3, 4], 'hello world', sinon.match.func
      And -> expect(@cb.getCall(0).args[3]('tim')).to.equal 'm i t'

    context 'with *', ->
      Given -> @wrapped = @v 'a*o', @cb
      Then -> expect(@wrapped).with([]).to.throw('A parameter of type Object is required.')

    context 'with |', ->
      Given -> @wrapped = @v 'a|so', @cb
      
      context 'called with first param', ->
        When -> @wrapped [1], {}
        Then -> expect(@cb).to.have.been.calledWith [1], {}

      context 'called with second param', ->
        When -> @wrapped 'string', {}
        Then -> expect(@cb).to.have.been.calledWith 'string', {}

      context 'called with neither', ->
        When -> @wrapped {}
        Then -> expect(@cb).to.have.been.calledWith undefined, {}

      context 'called with neither and populate', ->
        Given -> @wrapped = @v '+a|so', @cb
        When -> @wrapped {}
        Then -> expect(@cb).to.have.been.calledWith [], {}

    context 'with []', ->
      Given -> @wrapped = @v '[s]1', @cb
      When -> @wrapped 'string', 2
      Then -> expect(@cb).to.have.been.calledWith ['string'], 2

    context 'with [] and |', ->
      Given -> @wrapped = @v '[s]|ab', @cb
      
      context 'called with first param', ->
        When -> @wrapped 'string', true
        Then -> expect(@cb).to.have.been.calledWith ['string'], true

      context 'called with second param', ->
        When -> @wrapped [1], true
        Then -> expect(@cb).to.have.been.calledWith [1], true

      context 'called with neither', ->
        When -> @wrapped true
        Then -> expect(@cb).to.have.been.calledWith undefined, true

      context 'called with neither and populate', ->
        Given -> @wrapped = @v '+[s]|ab', @cb
        When -> @wrapped true
        Then -> expect(@cb).to.have.been.calledWith [''], true

    context 'with [] | []', ->
      Given -> @wrapped = @v '[s]|[1]o', @cb

      context 'called with first param', ->
        When -> @wrapped 'string', {}
        Then -> expect(@cb).to.have.been.calledWith ['string'], {}

      context 'called with second param', ->
        When -> @wrapped 2, {}
        Then -> expect(@cb).to.have.been.calledWith [2], {}

      context 'called with neither', ->
        When -> @wrapped {}
        Then -> expect(@cb).to.have.been.calledWith undefined, {}

      context 'called with neither and populate', ->
        Given -> @wrapped = @v '+[s]|[1]o', @cb
        When -> @wrapped {}
        Then -> expect(@cb).to.have.been.calledWith [''], {}

    context 'crazy combination of letters and symbols', ->
      Given -> @v.populate 'String', 'foo bar'
      Given -> @wrapped = @v '-+oo[a]+1_s*a|[b]', @cb
      When -> @wrapped {foo: 'bar'}, [1], '', true, 2
      Then -> expect(@cb).to.have.been.calledWith {}, {foo: 'bar'}, [[1]], 0, 'foo bar', [true], 2

    context 'with a custom type', ->
      Given -> @v.letters 'Q', 'Quux'
      Given -> @Quux = class Quux
      Given -> @wrapped = @v 'sQa', @cb
      Given -> @qx = new @Quux()
      When -> @wrapped 'string', @qx, [1,2]
      Then -> expect(@cb).to.have.been.calledWith 'string', @qx, [1,2]

    context 'with a custom symbol', ->
      Given -> @v.symbols '!', (arg, context) ->
        return !!arg
      Given -> @wrapped = @v '!s!a!1', @cb
      When -> @wrapped '', [], 3
      Then -> expect(@cb).to.have.been.calledWith false, true, true

    context 'with a custom symbol in conjunction with other symbols', ->
      Given -> @v.symbols '!', (arg, context) ->
        return !!arg
      Given -> @wrapped = @v '!s+!a!1', @cb
      When -> @wrapped '', 3
      Then -> expect(@cb).to.have.been.calledWith false, true, true

    context 'expecting a return value', ->
      Given -> @cb = sinon.stub()
      Given -> @cb.withArgs([1]).returns 'foo'
      Given -> @wrapped  = @v 'a', @cb
      When -> @res = @wrapped [1]
      Then -> expect(@res).to.equal 'foo'

    context 'configure', ->
      Given -> @v.configure
        defaults:
          'Array': ['foo']
      Given -> @wrapped = @v '+a', @cb
      When -> @wrapped()
      Then -> expect(@cb).to.have.been.calledWith ['foo']

      context 'reset', ->
        Given -> @v.reset()
        Given -> @wrapped = @v '+a', @cb
        When -> @wrapped()
        Then -> expect(@cb).to.have.been.calledWith []
