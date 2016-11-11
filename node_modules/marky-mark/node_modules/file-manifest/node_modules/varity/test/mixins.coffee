describe 'mixins', ->
  Given -> @stringify = sinon.stub()
  Given -> @mixins = sandbox '../lib/mixins',
    './stringify': @stringify

  describe '.capitalize', ->
    When -> @res = @mixins.capitalize('thing')
    Then -> expect(@res).to.equal('Thing')

  describe '.stringify', ->
    context 'custom object', ->
      Given -> @stringify.returns '[object Foo]'
      When -> @res = @mixins.stringify(@Foo)
      Then -> expect(@res).to.equal('Foo')

    context 'built in object', ->
      Given -> @stringify.returns '[object Array]'
      When -> @res = @mixins.stringify(Array)
      Then -> expect(@res).to.equal('Function')

    context 'undefined', ->
      Given -> @stringify.returns '[object Undefined]'
      When -> @res = @mixins.stringify(undefined)
      Then -> expect(@res).to.equal('Undefined')

  describe '.isDefined', ->
    context 'defined', ->
      When -> @res = @mixins.isDefined('thing')
      Then -> expect(@res).to.be.true()

    context 'undefined', ->
      When -> @res = @mixins.isDefined(undefined)
      Then -> expect(@res).to.be.false()

    context 'null', ->
      When -> @res = @mixins.isDefined(null)
      Then -> expect(@res).to.be.false()
