describe 'wrapper', ->
  Given -> @_ = spyObj('mixin')
  Given -> @Varity = sinon.spy()
  Given -> @Varity.configure = sinon.spy()
  Given -> @Varity.reset = sinon.spy()
  Given -> @Varity.extend = sinon.spy()
  Given -> @subject = sandbox '../lib',
    './varity': @Varity
    './mixins': 'some mixins'
    'underscore': @_

  Then -> expect(@_.mixin).calledWith('some mixins')

  describe '.configure', ->
    When -> @subject.configure
      foo: 'bar'
    Then -> expect(@Varity.configure).to.have.been.calledWith
      foo: 'bar'

  describe '.reset', ->
    When -> @subject.reset()
    Then -> expect(@Varity.reset).to.have.been.calledOnce

  describe '.letters', ->
    When -> @subject.letters 'Q', 'Quux'
    Then -> expect(@Varity.extend).to.have.been.calledWith 'letters.Q', 'Quux'

  describe '.symbols', ->
    When -> @subject.symbols '&', 'ampersand'
    Then -> expect(@Varity.extend).to.have.been.calledWith 'symbols.&', 'ampersand'

  describe '.defaults', ->
    When -> @subject.defaults 'Number', 2
    Then -> expect(@Varity.extend).to.have.been.calledWith 'defaults.Number', 2

  describe '.populate', ->
    afterEach ->
      @subject.defaults.restore()
    Given -> sinon.stub(@subject, 'defaults')

    context 'with key/value', ->
      Given -> @Varity._instanceOptions = {}
      When -> @subject.populate 'Number', 2
      Then -> expect(@Varity._instanceOptions.populate).to.deep.equal ['Number']
      And -> expect(@subject.defaults).to.have.been.calledWith 'Number', 2

    context 'with key only', ->
      Given -> @Varity._instanceOptions = {}
      When -> @subject.populate 'Number'
      Then -> expect(@Varity._instanceOptions.populate).to.deep.equal ['Number']
      And -> expect(@subject.defaults.called).not.to.be.true()

    context 'with true', ->
      Given -> @Varity._instanceOptions = {}
      When -> @subject.populate true
      Then -> expect(@Varity._instanceOptions.populate).to.be.true()
      And -> expect(@subject.defaults.called).not.to.be.true()

  describe '.extend', ->
    When -> @subject.extend 'Object', { foo: 'bar' }
    Then -> expect(@Varity.extend).to.have.been.calledWith 'extend.Object', { foo: 'bar' }
