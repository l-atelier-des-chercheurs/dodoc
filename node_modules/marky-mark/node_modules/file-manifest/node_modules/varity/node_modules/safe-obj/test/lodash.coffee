expect = require('indeed').expect
_ = require 'lodash'
_.mixin require '../lib'

describe 'lodash', ->
  describe '_.safe', ->
    context 'the property exists', ->
      Given -> @obj =
        foo:
          bar:
            baz:
              bozo: 'hello world'
      When -> @result = _.safe(@obj, 'foo.bar.baz.bozo')
      Then -> expect(@result).to.equal 'hello world'

    context 'the property doesn\'t exist', ->
      Given -> @obj = {}
      When -> @result = _.safe(@obj, 'foo.bar.baz.bozo')
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
      When -> @result = _.safe(@obj, 'foo.bar.list.0.foo')
      Then -> expect(@result).to.equal 'baby'

    context 'with a default', ->
      Given -> @obj =
        foo:
          bar: {}
      When -> @result = _.safe(@obj, 'foo.bar.baz', [])
      Then -> expect(@result).to.deep.equal []

    context 'with a function', ->
      Given -> @obj = ->
      Given -> @obj.foo =
        bar: 'baz'
      When -> @res = _.safe(@obj, 'foo.bar')
      Then -> expect(@res).to.equal 'baz'

    context 'with a falsy value', ->
      Given -> @obj =
        foo:
          bar: ''
      When -> @result = _.safe(@obj, 'foo.bar')
      Then -> expect(@result).to.equal ''

    context 'with null', ->
      When -> @result = _.safe(null, 'path')
      Then -> expect(@result).to.equal undefined

    context 'with sub-null', ->
      Given -> @obj =
        foo:
          bar: null
      When -> @result = _.safe(@obj, 'foo.bar')
      Then -> expect(@result).to.equal null

    context 'with no path and no default', ->
      When -> @result = _.safe({}, undefined)
      Then -> expect(@result).to.equal undefined

    context 'with no path and a default', ->
      When -> @result = _.safe({}, undefined, {})
      Then -> expect(@result).to.deep.equal {}

  describe '.expand', ->
    context 'with an empty object', ->
      Given -> @obj = {}
      When -> _.expand(@obj, 'nested.path', 'value')
      Then -> expect(@obj).to.deep.equal
        nested:
          path: 'value'

    context 'with a non empty object', ->
      Given -> @obj =
        nested:
          path: 'value'
      When -> _.expand(@obj, 'nested.path', [1,2])
      Then -> expect(@obj).to.deep.equal
        nested:
          path: [1,2]

    context 'with array indices', ->
      Given -> @obj =
        nested:
          path: [

          ]
      When -> _.expand(@obj, 'nested.path.0', {foo: 'bar'})
      Then -> expect(@obj).to.deep.equal
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
      Then -> expect(-> _.expand(null, 'path', [1])).not.to.throw()

    context 'with no path', ->
      Given -> @obj = {}
      When -> _(@obj).expand(undefined, 'foo')
      Then -> expect(@obj).to.deep.equal {}

    context 'with no value', ->
      Given -> @obj = {}
      When -> _(@obj).expand('foo.bar')
      Then -> expect(@obj).to.deep.equal {}

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
      Then -> expect(@obj.foo.bar).to.deep.equal { baz: 'quux' }

    context 'false', ->
      Given -> @obj =
        foo:
          bar: false
      When -> _(@obj).ensure('foo.bar', { baz: 'quux' })
      Then -> expect(@obj.foo.bar).to.deep.equal false

    context '0', ->
      Given -> @obj =
        foo:
          bar: 0
      When -> _(@obj).ensure('foo.bar', { baz: 'quux' })
      Then -> expect(@obj.foo.bar).to.deep.equal 0

    # Mostly testing isEqual implementation
    context 'custom not allowed values', ->
      context 'matching', ->
        context 'array', ->
          Given -> @obj =
            foo:
              bar: ['foo', 'bar']
          When -> _(@obj).ensure('foo.bar', [['foo', 'bar']], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal
            baz: 'quux'

        context 'object', ->
          Given -> @obj =
            foo:
              bar:
                hello: 'world'
          When -> _(@obj).ensure('foo.bar', [{ hello: 'world' }], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal
            baz: 'quux'

        context 'function', ->
          Given -> @func = -> return 'foo'
          Given -> @obj =
            foo:
              bar: @func
          When -> _(@obj).ensure('foo.bar', [@func], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal
            baz: 'quux'

        context 'primitive', ->
          Given -> @obj =
            foo:
              bar: 'hello world'
          When -> _(@obj).ensure('foo.bar', ['hello world'], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal
            baz: 'quux'

        context 'null', ->
          Given -> @obj =
            foo:
              bar: null
          When -> _(@obj).ensure('foo.bar', [null], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal
            baz: 'quux'

        context 'undef', ->
          Given -> @obj =
            foo:
              bar: undefined
          When -> _(@obj).ensure('foo.bar', [undefined], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal
            baz: 'quux'

      context 'not matching', ->
        context 'array', ->
          Given -> @obj =
            foo:
              bar: ['foo', 'bar']
          When -> _(@obj).ensure('foo.bar', [['bar', 'foo']], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal ['foo', 'bar']

        context 'object', ->
          Given -> @obj =
            foo:
              bar:
                nope: true
          When -> _(@obj).ensure('foo.bar', [{ hello: 'world' }], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal nope: true

        context 'function', ->
          Given -> @func = -> return 'foo'
          Given -> @func2 = -> return 'foo'
          Given -> @obj =
            foo:
              bar: @func2
          When -> _(@obj).ensure('foo.bar', [@func], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal @func2

        context 'primitive', ->
          Given -> @obj =
            foo:
              bar: 'hello world'
          When -> _(@obj).ensure('foo.bar', ['goodbyeworld'], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal 'hello world'

        context 'null', ->
          Given -> @obj =
            foo:
              bar: null
          When -> _(@obj).ensure('foo.bar', [undefined], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal { baz: 'quux' }

        context 'different types', ->
          Given -> @obj =
            foo:
              bar: [1, 2]
          When -> _(@obj).ensure('foo.bar', [{ hello: 'world' }], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal [1, 2]

        context 'different array lengths', ->
          Given -> @obj =
            foo:
              bar: [1, 2]
          When -> _(@obj).ensure('foo.bar', [[1, 2, 3]], { baz: 'quux' })
          Then -> expect(@obj.foo.bar).to.deep.equal [1, 2]

  describe '.allOf', ->
    context 'all present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = _.allOf(@obj, 'foo.nested', 'bar')
      Then -> expect(@res).to.equal true

    context 'not all present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = _.allOf(@obj, 'foo.nested', 'bar', 'baz.nested')
      Then -> expect(@res).to.equal false

    context 'with array', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = _.allOf(@obj, ['foo.nested', 'bar'])
      Then -> expect(@res).to.equal true

    context 'obj not an object', ->
      When -> @res = _.allOf('blah', ['foo.nested', 'bar'])
      Then -> expect(@res).to.equal false

  describe '.anyOf', ->
    context 'some present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = _.anyOf(@obj, 'foo.nested', 'bar', 'baz')
      Then -> expect(@res).to.equal true

    context 'none present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = _.anyOf(@obj, 'foo.berry', 'baroque', 'baz.nested')
      Then -> expect(@res).to.equal false

    context 'with array', ->
      Given -> @obj =
        foo:
          nested: 'foo'
        bar: 'bar'
      When -> @res = _.anyOf(@obj, ['foo.nested', 'bar', 'baz'])
      Then -> expect(@res).to.equal true

    context 'obj not an object', ->
      When -> @res = _.anyOf('blah', ['foo.nested', 'bar', 'baz'])
      Then -> expect(@res).to.equal false

  describe '.noneOf', ->
    context 'some present', ->
      Given -> @obj =
        foo:
          nested: 'foo'
      When -> @res = _.noneOf(@obj, 'foo.nested', 'bar')
      Then -> expect(@res).to.equal false

    context 'none present', ->
      Given -> @obj = {}
      When -> @res = _.noneOf(@obj, 'foo.neste', 'bar')
      Then -> expect(@res).to.equal true
