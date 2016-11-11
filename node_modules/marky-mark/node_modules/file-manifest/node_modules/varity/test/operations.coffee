describe 'operations', ->
  Given -> @subject = sandbox '../lib/operations',
    underscore: _

  Given -> @this =
    options:
      defaults:
        'String': ''

  describe 'populate', ->
    context 'defined', ->
      When -> @res = @subject.populate.call @this, 'something', {}
      Then -> expect(@res).to.equal 'something'

    context 'not defined', ->
      When -> @res = @subject.populate.call @this, undefined,
        types: ['String']
      Then -> expect(@res).to.equal ''

  describe 'nonEmpty', ->
    Given -> @this.options.defaults.Array = ['default']
    context 'not empty', ->
      When -> @res = @subject.nonEmpty.call @this, ['not empty'], {}
      Then -> expect(@res).to.deep.equal ['not empty']

    context 'empty', ->
      When -> @res = @subject.nonEmpty.call @this, [],
        types: ['Array']
      Then -> expect(@res).to.deep.equal ['default']

  describe 'required', ->
    context 'defined', ->
      When -> @res = @subject.required.call @this, 'defined', {}
      Then -> expect(@res).to.equal 'defined'

    context 'not defined', ->
      Then -> expect(@subject.required).with(undefined,
        types: ['String']
      ).to.throw('A parameter of type String is required.')

  describe 'optional', ->
    context 'both are the right type', ->
      Given -> @this.thingOrDefault = sinon.stub()
      Given -> @this.thingOrDefault.returns('next')
      When -> @res = @subject.optional.call @this, 'string',
        args: ['next']
      Then -> expect(@res).to.equal 'string'

    context 'arg is the wrong type', ->
      When -> @res = @subject.optional.call @this, undefined, {}
      Then -> expect(@res).to.not.be.defined()
      
    context 'only first is the right type', ->
      Given -> @this.thingOrDefault = sinon.stub()
      Given -> @this.thingOrDefault.returns(undefined)
      When -> @res = @subject.optional.call @this, 'string',
        args: [{}]
      Then -> expect(@res).to.not.be.defined()

    context 'nextArg does not exist', ->
      Given -> @this.thingOrDefault = sinon.stub()
      Given -> @this.thingOrDefault.returns(undefined)
      When -> @res = @subject.optional.call @this, 'string',
        args: undefined
      Then -> expect(@res).to.not.be.defined()

  describe 'extend', ->
    Given -> @this.options.extend =
      'Object':
        foo: 'bar'
      'Array': [3, 4]
      'String': 'world'
      'Function': (name) -> name.split('').reverse().join('')

    context 'object', ->
      When -> @res = @subject.extend.call @this, { baz: 'quux' }
      Then -> expect(@res).to.deep.equal
        foo: 'bar'
        baz: 'quux'
      And -> expect(@this.options.extend['Object']).to.deep.equal
        foo: 'bar'

    context 'array', ->
      When -> @res = @subject.extend.call @this, [1, 2]
      Then -> expect(@res).to.deep.equal [1, 2, 3, 4]
      And -> expect(@this.options.extend['Array']).to.deep.equal [3, 4]

    context 'string', ->
      When -> @res = @subject.extend.call @this, 'hello'
      Then -> expect(@res).to.equal 'hello world'

    context 'function', ->
      Given -> @fn = sinon.spy()
      When -> @res = @subject.extend.call @this, @fn
      And -> @res 'tim'
      Then -> expect(@fn).to.have.been.calledWith 'mit'
