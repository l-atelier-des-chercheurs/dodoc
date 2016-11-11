_.mixin(_._safe)

describe 'underscore', ->
  describe '_.safe', ->
    context 'the property exists', ->
      Given -> @obj =
        foo:
          bar:
            baz:
              bozo: 'hello world'
      When -> @result = _(@obj).safe('foo.bar.baz.bozo')
      Then -> expect(@result).to.equal 'hello world'

    context 'the property doesn\'t exist', ->
      Given -> @obj = {}
      When -> @result = _(@obj).safe('foo.bar.baz.bozo')
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
      When -> @result = _(@obj).safe('foo.bar.list.0.foo')
      Then -> expect(@result).to.equal 'baby'

    context 'with a default', ->
      Given -> @obj =
        foo:
          bar: {}
      When -> @result = _(@obj).safe('foo.bar.baz', [])
      Then -> expect(@result).to.eql []

    context 'with a function', ->
      Given -> @obj = ->
      Given -> @obj.foo =
        bar: 'baz'
      When -> @res = _(@obj).safe('foo.bar')
      Then -> expect(@res).to.equal 'baz'

    context 'with a falsy value', ->
      Given -> @obj =
        foo:
          bar: ''
      When -> @result = _(@obj).safe('foo.bar')
      Then -> expect(@result).to.equal ''

    context 'with null', ->
      When -> @result = _(null).safe('path')
      Then -> expect(@result).to.equal undefined

    context 'with sub-null', ->
      Given -> @obj =
        foo:
          bar: null
      When -> @result = _(@obj).safe('foo.bar')
      Then -> expect(@result).to.equal null

    context 'with no path and no default', ->
      When -> @result = _({}).safe(undefined)
      Then -> expect(@result).to.equal undefined

    context 'with no path and a default', ->
      When -> @result = _({}).safe(undefined, {})
      Then -> expect(@result).to.eql {}

  describe '.expand', ->
    context 'with an empty object', ->
      Given -> @obj = {}
      When -> _.expand(@obj, 'nested.path', 'value')
      Then -> expect(@obj).to.eql
        nested:
          path: 'value'

    context 'with a non empty object', ->
      Given -> @obj =
        nested:
          path: 'value'
      When -> _.expand(@obj, 'nested.path', [1,2])
      Then -> expect(@obj).to.eql
        nested:
          path: [1,2]

    context 'with array indices', ->
      Given -> @obj =
        nested:
          path: [

          ]
      When -> _.expand(@obj, 'nested.path.0', {foo: 'bar'})
      Then -> expect(@obj).to.eql
        nested:
          path: [
            foo: 'bar'
          ]

    context 'with a function', ->
      Given -> @obj = ->
      When -> _(@obj).expand('foo.bar', 'baz')
      Then -> expect(typeof @obj).to.equal 'function'
      And -> expect(@obj.foo.bar).to.equal 'baz'

    context 'with null', ->
      Then -> expect(-> _.expand(null, 'path', [1])).not.to.throwException()

    context 'with no path', ->
      Given -> @obj = {}
      When -> _(@obj).expand(undefined, 'foo')
      Then -> expect(@obj).to.eql {}

    context 'with no value', ->
      Given -> @obj = {}
      When -> _(@obj).expand('foo.bar')
      Then -> expect(@obj).to.eql {}

  describe '.ensure', ->
    context 'already set', ->
      Given -> @obj =
        fruits:
          i:
            love: 'orange'
      When -> _(@obj).ensure('fruits.i.love', 'banana')
      Then -> expect(@obj.fruits.i.love).to.equal 'orange'

    context 'not yet set', ->
      Given -> @obj = {}
      When -> _(@obj).ensure('fruits.i.love', 'banana')
      Then -> expect(@obj.fruits.i.love).to.equal 'banana'

    context 'null', ->
      Given -> @obj =
        foo:
          bar: null
      When -> _(@obj).ensure('foo.bar', { baz: 'quux' })
      Then -> expect(@obj.foo.bar).to.eql
        baz: 'quux'

    context '0', ->
      Given -> @obj =
        foo:
          bar: 0
      When -> _(@obj).ensure('foo.bar', { baz: 'quux' })
      Then -> expect(@obj.foo.bar).to.eql 0

    # Mostly testing isEqual implementation
    context 'custom not allowed values', ->
      context 'matching', ->
        context 'array', ->
          Given -> @obj =
            foo:
              bar: ['foo', 'bar']
          When -> _(@obj).ensure('foo.bar', [['foo', 'bar']], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql
            baz: 'quux'

        context 'object', ->
          Given -> @obj =
            foo:
              bar:
                hello: 'world'
          When -> _(@obj).ensure('foo.bar', [{ hello: 'world' }], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql
            baz: 'quux'

        context 'function', ->
          Given -> @func = -> return 'foo'
          Given -> @obj =
            foo:
              bar: @func
          When -> _(@obj).ensure('foo.bar', [@func], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql
            baz: 'quux'

        context 'primitive', ->
          Given -> @obj =
            foo:
              bar: 'hello world'
          When -> _(@obj).ensure('foo.bar', ['hello world'], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql
            baz: 'quux'

        context 'null', ->
          Given -> @obj =
            foo:
              bar: null
          When -> _(@obj).ensure('foo.bar', [null], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql
            baz: 'quux'

        context 'undef', ->
          Given -> @obj =
            foo:
              bar: undefined
          When -> _(@obj).ensure('foo.bar', [undefined], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql
            baz: 'quux'

      context 'not matching', ->
        context 'array', ->
          Given -> @obj =
            foo:
              bar: ['foo', 'bar']
          When -> _(@obj).ensure('foo.bar', [['bar', 'foo']], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql ['foo', 'bar']

        context 'object', ->
          Given -> @obj =
            foo:
              bar:
                nope: true
          When -> _(@obj).ensure('foo.bar', [{ hello: 'world' }], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql nope: true

        context 'function', ->
          Given -> @func = -> return 'foo'
          Given -> @func2 = -> return 'foo'
          Given -> @obj =
            foo:
              bar: @func2
          When -> _(@obj).ensure('foo.bar', [@func], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql @func2

        context 'primitive', ->
          Given -> @obj =
            foo:
              bar: 'hello world'
          When -> _(@obj).ensure('foo.bar', ['goodbyeworld'], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.eql 'hello world'

        context 'null', ->
          Given -> @obj =
            foo:
              bar: null
          When -> _(@obj).ensure('foo.bar', [undefined], { baz: 'quux' })
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
      When -> @res = _(@obj).allOf('foo.nested', 'bar')
      Then -> expect(@res).to.equal true

    context 'not all present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = _(@obj).allOf('foo.nested', 'bar', 'baz.nested')
      Then -> expect(@res).to.equal false

    context 'with array', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = _(@obj).allOf(['foo.nested', 'bar'])
      Then -> expect(@res).to.equal true

    context 'obj not an object', ->
      When -> @res = _('blah').allOf(['foo.nested', 'bar'])
      Then -> expect(@res).to.equal false

  describe '.anyOf', ->
    context 'some present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = _(@obj).anyOf('foo.nested', 'bar', 'baz')
      Then -> expect(@res).to.equal true

    context 'none present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = _(@obj).anyOf('foo.berry', 'baroque', 'baz.nested')
      Then -> expect(@res).to.equal false

    context 'with array', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = _(@obj).anyOf(['foo.nested', 'bar', 'baz'])
      Then -> expect(@res).to.equal true

    context 'obj not an object', ->
      When -> @res = _('blah').anyOf(['foo.nested', 'bar', 'baz'])
      Then -> expect(@res).to.equal false

  describe '.noneOf', ->
    context 'some present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
      When -> @res = _(@obj).noneOf('foo.nested', 'bar')
      Then -> expect(@res).to.equal false

    context 'none present', ->
      Given -> @obj = {}
      When -> @res = _(@obj).noneOf('foo.neste', 'bar')
      Then -> expect(@res).to.equal true
