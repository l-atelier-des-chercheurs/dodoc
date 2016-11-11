lo.mixin(_._safe)

describe 'lodash', ->
  describe '_.safe', ->
    context 'the property exists', ->
      Given -> @obj =
        foo:
          bar:
            baz:
              bozo: 'hello world'
      When -> @result = lo.safe(@obj, 'foo.bar.baz.bozo')
      Then -> expect(@result).to.equal 'hello world'

    context 'the property doesn\'t exist', ->
      Given -> @obj = {}
      When -> @result = lo.safe(@obj, 'foo.bar.baz.bozo')
      Then -> expect(@result).to.equal undefined

    context 'with array indices', ->
      Given -> @obj =
        foo:
          bar:
            list: [
                foo: 'baby'
                fart: 'bag'
              ,
                foo: 'not baby'
                fart: 'jar'
            ]
      When -> @result = lo.safe(@obj, 'foo.bar.list.0.foo')
      Then -> expect(@result).to.equal 'baby'

    context 'with a default', ->
      Given -> @obj =
        foo:
          bar: {}
      When -> @result = lo.safe(@obj, 'foo.bar.baz', [])
      Then -> expect(@result).to.eql []

    context 'with a function', ->
      Given -> @obj = ->
      Given -> @obj.foo =
        bar: 'baz'
      When -> @res = lo.safe(@obj, 'foo.bar')
      Then -> expect(@res).to.equal 'baz'

    context 'with a falsy value', ->
      Given -> @obj =
        foo:
          bar: ''
      When -> @result = lo.safe(@obj, 'foo.bar')
      Then -> expect(@result).to.equal ''

    context 'with null', ->
      When -> @result = lo.safe(null, 'path')
      Then -> expect(@result).to.equal undefined

    context 'with sub-null', ->
      Given -> @obj =
        foo:
          bar: null
      When -> @result = lo.safe(@obj, 'foo.bar')
      Then -> expect(@result).to.equal null

    context 'with no path and no default', ->
      When -> @result = lo.safe({}, undefined)
      Then -> expect(@result).to.equal undefined

    context 'with no path and a default', ->
      When -> @result = lo.safe({}, undefined, {})
      Then -> expect(@result).to.eql {}

  describe '.expand', ->
    context 'with an empty object', ->
      Given -> @obj = {}
      When -> lo.expand(@obj, 'nested.path', 'value')
      Then -> expect(@obj).to.eql
        nested:
          path: 'value'

    context 'with a non empty object', ->
      Given -> @obj =
        nested:
          path: 'value'
      When -> lo.expand(@obj, 'nested.path', [1,2])
      Then -> expect(@obj).to.eql
        nested:
          path: [1,2]

    context 'with array indices', ->
      Given -> @obj =
        nested:
          path: [

          ]
      When -> lo.expand(@obj, 'nested.path.0', {foo: 'bar'})
      Then -> expect(@obj).to.eql
        nested:
          path: [
            foo: 'bar'
          ]

    context 'with a function', ->
      Given -> @obj = ->
      When -> lo.expand(@obj, 'foo.bar', 'baz')
      Then -> expect(typeof @obj).to.equal 'function'
      And -> expect(@obj.foo.bar).to.equal 'baz'

    context 'with null', ->
      Then -> expect(-> lo.expand(null, 'path', [1])).not.to.throwException()

    context 'with no path', ->
      Given -> @obj = {}
      When -> lo.expand(@obj, undefined, 'foo')
      Then -> expect(@obj).to.eql {}

    context 'with no value', ->
      Given -> @obj = {}
      When -> lo.expand(@obj, 'foo.bar')
      Then -> expect(@obj).to.eql {}

  describe '.ensure', ->
    context 'already set', ->
      Given -> @obj =
        fruits:
          i:
            love: 'orange'
      When -> lo.ensure(@obj, 'fruits.i.love', 'banana')
      Then -> expect(@obj.fruits.i.love).to.equal 'orange'

    context 'not yet set', ->
      Given -> @obj = {}
      When -> lo.ensure(@obj, 'fruits.i.love', 'banana')
      Then -> expect(@obj.fruits.i.love).to.equal 'banana'

    context 'null', ->
      Given -> @obj =
        foo:
          bar: null
      When -> lo.ensure(@obj, 'foo.bar', { baz: 'quux' })
      Then -> expect(@obj.foo.bar).to.eql { baz: 'quux' }

    context 'false', ->
      Given -> @obj =
        foo:
          bar: false
      When -> lo.ensure(@obj, 'foo.bar', { baz: 'quux' })
      Then -> expect(@obj.foo.bar).to.eql false

    context '0', ->
      Given -> @obj =
        foo:
          bar: 0
      When -> lo.ensure(@obj, 'foo.bar', { baz: 'quux' })
      Then -> expect(@obj.foo.bar).to.eql 0

    # Mostly testing isEqual implementation
    context 'custom not allowed values', ->
      context 'matching', ->
        context 'array', ->
          Given -> @obj =
            foo:
              bar: ['foo', 'bar']
          When -> lo.ensure(@obj, 'foo.bar', [['foo', 'bar']], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql
            baz: 'quux'

        context 'object', ->
          Given -> @obj =
            foo:
              bar:
                hello: 'world'
          When -> lo.ensure(@obj, 'foo.bar', [{ hello: 'world' }], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql
            baz: 'quux'

        context 'function', ->
          Given -> @func = -> return 'foo'
          Given -> @obj =
            foo:
              bar: @func
          When -> lo.ensure(@obj, 'foo.bar', [@func], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql
            baz: 'quux'

        context 'primitive', ->
          Given -> @obj =
            foo:
              bar: 'hello world'
          When -> lo.ensure(@obj, 'foo.bar', ['hello world'], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql
            baz: 'quux'

        context 'null', ->
          Given -> @obj =
            foo:
              bar: null
          When -> lo.ensure(@obj, 'foo.bar', [null], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql
            baz: 'quux'

        context 'undef', ->
          Given -> @obj =
            foo:
              bar: undefined
          When -> lo.ensure(@obj, 'foo.bar', [undefined], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql
            baz: 'quux'

      context 'not matching', ->
        context 'array', ->
          Given -> @obj =
            foo:
              bar: ['foo', 'bar']
          When -> lo.ensure(@obj, 'foo.bar', [['bar', 'foo']], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql ['foo', 'bar']

        context 'object', ->
          Given -> @obj =
            foo:
              bar:
                nope: true
          When -> lo.ensure(@obj, 'foo.bar', [{ hello: 'world' }], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql nope: true

        context 'function', ->
          Given -> @func = -> return 'foo'
          Given -> @func2 = -> return 'foo'
          Given -> @obj =
            foo:
              bar: @func2
          When -> lo.ensure(@obj, 'foo.bar', [@func], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql @func2

        context 'primitive', ->
          Given -> @obj =
            foo:
              bar: 'hello world'
          When -> lo.ensure(@obj, 'foo.bar', ['goodbyeworld'], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql 'hello world'

        context 'null', ->
          Given -> @obj =
            foo:
              bar: null
          When -> lo.ensure(@obj, 'foo.bar', [undefined], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql { baz: 'quux' }

        context 'different types', ->
          Given -> @obj =
            foo:
              bar: [1, 2]
          When -> _(@obj).ensure('foo.bar', [{ hello: 'world' }], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql [1, 2]

        context 'different array lengths', ->
          Given -> @obj =
            foo:
              bar: [1, 2]
          When -> _(@obj).ensure('foo.bar', [[1, 2, 3]], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql [1, 2]

  describe '.allOf', ->
    context 'all present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = lo.allOf(@obj, 'foo.nested', 'bar')
      Then -> expect(@res).to.equal true

    context 'not all present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = lo.allOf(@obj, 'foo.nested', 'bar', 'baz.nested')
      Then -> expect(@res).to.equal false

    context 'with array', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = lo.allOf(@obj, ['foo.nested', 'bar'])
      Then -> expect(@res).to.equal true

    context 'obj not an object', ->
      When -> @res = lo.allOf('blah', ['foo.nested', 'bar'])
      Then -> expect(@res).to.equal false

  describe '.anyOf', ->
    context 'some present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = lo.anyOf(@obj, 'foo.nested', 'bar', 'baz')
      Then -> expect(@res).to.equal true

    context 'none present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = lo.anyOf(@obj, 'foo.berry', 'baroque', 'baz.nested')
      Then -> expect(@res).to.equal false

    context 'with array', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = lo.anyOf(@obj, ['foo.nested', 'bar', 'baz'])
      Then -> expect(@res).to.equal true

    context 'obj not an object', ->
      When -> @res = lo.anyOf('blah', ['foo.nested', 'bar', 'baz'])
      Then -> expect(@res).to.equal false

  describe '.noneOf', ->
    context 'some present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
      When -> @res = lo.noneOf(@obj, 'foo.nested', 'bar')
      Then -> expect(@res).to.equal false

    context 'none present', ->
      Given -> @obj = {}
      When -> @res = lo.noneOf(@obj, 'foo.neste', 'bar')
      Then -> expect(@res).to.equal true
