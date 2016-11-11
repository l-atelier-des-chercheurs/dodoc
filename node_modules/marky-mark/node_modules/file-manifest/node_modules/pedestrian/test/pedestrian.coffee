describe "pedestrian", ->
  Given -> @kindly = spyObj 'get'
  Given -> @callerId = spyObj 'getData'
  Given -> @subject = sandbox "../lib/pedestrian",
    kindly: @kindly
    'caller-id': @callerId

  describe ".walk", ->
    context 'sync', ->
      context 'no filter', ->
        Given -> @kindly.get.withArgs("/dir").returns
          files: ["/dir/foo.txt"]
          directories: ["/dir/bar"]
        Given -> @kindly.get.withArgs("/dir/bar").returns
          files: ["/dir/bar/baz.txt"],
          directories: []
        When -> @result = @subject.walk("/dir")
        Then -> expect(@result).to.deep.equal [ '/dir/foo.txt', '/dir/bar/baz.txt' ]

      context 'with one filter', ->
        Given -> @kindly.get.withArgs('/dir').returns
          files: ['/dir/foo.css', '/dir/foo.js']
          directories: ['/dir/bar']
        Given -> @kindly.get.withArgs('/dir/bar').returns
          files: ['/dir/bar/baz.css', '/dir/bar/baz.js']
          directories: []
        When -> @result = @subject.walk('/dir', '**/*.js')
        Then -> expect(@result).to.deep.equal [ '/dir/foo.js', '/dir/bar/baz.js' ]

      context 'with several filters', ->
        Given -> @kindly.get.withArgs('/dir').returns
          files: ['/dir/foo.css', '/dir/foo.js', '/dir/baz.coffee']
          directories: ['/dir/bar']
        Given -> @kindly.get.withArgs('/dir/bar').returns
          files: ['/dir/bar/baz.css', '/dir/bar/baz.js']
          directories: []
        Given -> @filters = [ '**/*.js', '**/*.coffee' ]
        When -> @result = @subject.walk('/dir', @filters)
        Then -> expect(@result).to.deep.equal [ '/dir/foo.js', '/dir/bar/baz.js', '/dir/baz.coffee' ]

      context 'with a negate filter', ->
        Given -> @kindly.get.withArgs('/dir').returns
          files: ['/dir/foo.css', '/dir/foo.js', '/dir/baz.coffee']
          directories: ['/dir/bar']
        Given -> @kindly.get.withArgs('/dir/bar').returns
          files: ['/dir/bar/baz.css', '/dir/bar/baz.js']
          directories: []
        Given -> @filters = [ '**/*.js', '!**/*.coffee' ]
        When -> @result = @subject.walk('/dir', @filters)
        Then -> expect(@result).to.deep.equal [ '/dir/foo.js', '/dir/bar/baz.js' ]

      context 'with an empty array of filters', ->
        Given -> @kindly.get.withArgs('/dir').returns
          files: ['/dir/foo.css', '/dir/foo.js']
          directories: ['/dir/bar']
        Given -> @kindly.get.withArgs('/dir/bar').returns
          files: ['/dir/bar/baz.css', '/dir/bar/baz.js']
          directories: []
        When -> @result = @subject.walk('/dir', [])
        Then -> expect(@result).to.deep.equal [ '/dir/foo.css', '/dir/foo.js', '/dir/bar/baz.css', '/dir/bar/baz.js' ]

      context 'relative path', ->
        Given -> @callerId.getData.returns
          filePath: '/dir/hah/blah.js'
        Given -> @kindly.get.withArgs('/dir/lib').returns
          files: ['/dir/lib/foo.css', '/dir/lib/foo.js']
          directories: ['/dir/lib/bar']
        Given -> @kindly.get.withArgs('/dir/lib/bar').returns
          files: ['/dir/lib/bar/baz.css', '/dir/lib/bar/baz.js']
          directories: []
        When -> @result = @subject.walk '../lib'
        Then -> expect(@result).to.deep.equal [ '/dir/lib/foo.css', '/dir/lib/foo.js', '/dir/lib/bar/baz.css', '/dir/lib/bar/baz.js' ]

    context 'async', ->
      Given -> @cb = sinon.spy()
      context 'no filter', ->
        Given -> @kindly.get.withArgs("/dir").callsArgWith 1, null,
          files: ["/dir/foo.txt"]
          directories: ["/dir/bar"]
        Given -> @kindly.get.withArgs("/dir/bar").callsArgWith 1, null,
          files: ["/dir/bar/baz.txt"],
          directories: []
        When -> @subject.walk("/dir", @cb)
        Then -> expect(@cb).to.have.been.calledWith null, [ '/dir/foo.txt', '/dir/bar/baz.txt' ]

      context 'with one filter', ->
        Given -> @kindly.get.withArgs('/dir').callsArgWith 1, null,
          files: ['/dir/foo.css', '/dir/foo.js']
          directories: ['/dir/bar']
        Given -> @kindly.get.withArgs('/dir/bar').callsArgWith 1, null,
          files: ['/dir/bar/baz.css', '/dir/bar/baz.js']
          directories: []
        When -> @subject.walk('/dir', '**/*.js', @cb)
        Then -> expect(@cb).to.have.been.calledWith null, [ '/dir/foo.js', '/dir/bar/baz.js' ]

      context 'with several filters', ->
        Given -> @kindly.get.withArgs('/dir').callsArgWith 1, null,
          files: ['/dir/foo.css', '/dir/foo.js', '/dir/baz.coffee']
          directories: ['/dir/bar']
        Given -> @kindly.get.withArgs('/dir/bar').callsArgWith 1, null,
          files: ['/dir/bar/baz.css', '/dir/bar/baz.js']
          directories: []
        Given -> @filters = [ '**/*.js', '**/*.coffee' ]
        When -> @subject.walk('/dir', @filters, @cb)
        Then -> expect(@cb).to.have.been.calledWith null, [ '/dir/foo.js', '/dir/bar/baz.js', '/dir/baz.coffee' ]

      context 'with an empty array of filters', ->
        Given -> @kindly.get.withArgs('/dir').callsArgWith 1, null,
          files: ['/dir/foo.css', '/dir/foo.js']
          directories: ['/dir/bar']
        Given -> @kindly.get.withArgs('/dir/bar').callsArgWith 1, null,
          files: ['/dir/bar/baz.css', '/dir/bar/baz.js']
          directories: []
        When -> @subject.walk('/dir', [], @cb)
        Then -> expect(@cb).to.have.been.calledWith null, [ '/dir/foo.css', '/dir/foo.js', '/dir/bar/baz.css', '/dir/bar/baz.js' ]

      context 'relative path', ->
        Given -> @callerId.getData.returns
          filePath: '/dir/hah/blah.js'
        Given -> @kindly.get.withArgs('/dir/lib').callsArgWith 1, null,
          files: ['/dir/lib/foo.css', '/dir/lib/foo.js']
          directories: ['/dir/lib/bar']
        Given -> @kindly.get.withArgs('/dir/lib/bar').callsArgWith 1, null,
          files: ['/dir/lib/bar/baz.css', '/dir/lib/bar/baz.js']
          directories: []
        When -> @subject.walk '../lib', @cb
        Then -> expect(@cb).to.have.been.calledWith null, [ '/dir/lib/foo.css', '/dir/lib/foo.js', '/dir/lib/bar/baz.css', '/dir/lib/bar/baz.js' ]
