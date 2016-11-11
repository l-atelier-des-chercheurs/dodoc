describe "kindly", ->
  Given -> @fs = spyObj(['readdirSync', 'statSync', 'readdir', 'stat'])
  Given -> @kindly = sandbox '../lib/kindly',
    fs: @fs

  context 'sync', ->
    Given -> @fs.readdirSync.withArgs('/dir').returns [
      'foo.txt', 'bar', 'symlink'
    ]
    Given -> @fs.statSync.withArgs('/dir/foo.txt').returns
      isFile: -> true
      isDirectory: -> false
    Given -> @fs.statSync.withArgs('/dir/bar').returns
      isFile: -> false
      isDirectory: -> true
    Given -> @fs.statSync.withArgs('/dir/symlink').returns
      isFile: -> false
      isDirectory: -> false
    When -> @result = @kindly.get('/dir')
    Then -> expect(@result).to.deep.equal
      files: ['/dir/foo.txt']
      directories: ['/dir/bar']
      other: ['/dir/symlink']

  context 'async', ->
    Given -> @fs.readdir.withArgs('/dir', sinon.match.func).callsArgWith 1, null, ['foo.txt', 'bar', 'symlink']
    Given -> @fs.stat.withArgs('/dir/foo.txt', sinon.match.func).callsArgWith 1, null,
      isFile: -> true
      isDirectory: -> false
    Given -> @fs.stat.withArgs('/dir/bar', sinon.match.func).callsArgWith 1, null,
      isFile: -> false
      isDirectory: -> true
    Given -> @fs.stat.withArgs('/dir/symlink', sinon.match.func).callsArgWith 1, null,
      isFile: -> false
      isDirectory: -> false
    Given -> @cb = sinon.spy()
    When -> @kindly.get('/dir', @cb)
    Then -> expect(@cb).to.have.been.calledWith undefined,
      files: ['/dir/foo.txt']
      directories: ['/dir/bar']
      other: ['/dir/symlink']
