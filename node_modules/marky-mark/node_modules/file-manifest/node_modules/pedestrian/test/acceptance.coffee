describe 'acceptance', ->
  Given -> @pedestrian = require '../lib/pedestrian'
  
  describe 'sync', ->
    When -> @files = @pedestrian.walk __dirname + '/fixtures'
    And -> @files = @files.map (file) -> return file.split('pedestrian/test/fixtures/')[1]
    Then -> expect.chain(@files).to.contain('foo.js').andTo.contain('bar.js').andTo.contain('baz/quux.js').test()

  describe 'async', ->
    When (done) -> @pedestrian.walk __dirname + '/fixtures', (err, @files) => done()
    And -> @files = @files.map (file) -> return file.split('pedestrian/test/fixtures/')[1]
    Then -> expect.chain(@files).to.contain('foo.js').andTo.contain('bar.js').andTo.contain('baz/quux.js').test()

  describe 'with filters', ->
    describe 'one level', ->
      When (done) -> @pedestrian.walk __dirname + '/fixtures', ['*.js'], (err, @files) => done()
      And -> @files = @files.map (file) -> return file.split('pedestrian/test/fixtures/')[1]
      Then -> expect.chain(@files).to.contain('foo.js').andTo.contain('bar.js').test()

    describe 'nested levels', ->
      When (done) -> @pedestrian.walk __dirname + '/fixtures', ['**/*.js'], (err, @files) => done()
      And -> @files = @files.map (file) -> return file.split('pedestrian/test/fixtures/')[1]
      Then -> expect.chain(@files).to.contain('foo.js').andTo.contain('bar.js').andTo.contain('baz/quux.js').test()

    describe 'with files disabled', ->
      When (done) -> @pedestrian.walk __dirname + '/fixtures', ['**/*.js', '!foo.js'], (err, @files) => done()
      And -> @files = @files.map (file) -> return file.split('pedestrian/test/fixtures/')[1]
      Then -> expect.chain(@files).to.contain('bar.js').andTo.contain('baz/quux.js').test()

    describe 'complicated patterns', ->
      When (done) -> @pedestrian.walk __dirname + '/fixtures', ['**/*.js', '**/*.coffee', '!**/foo.*'], (err, @files) => done()
      And -> @files = @files.map (file) -> return file.split('pedestrian/test/fixtures/')[1]
      Then -> expect.chain(@files).to.contain('bar.js').andTo.contain('baz/quux.js').andTo.contain('baz/quux.coffee')

  describe 'relative path', ->
    describe 'without filters', ->
      When -> @files = @pedestrian.walk './fixtures'
      And -> @files = @files.map (file) -> return file.split('pedestrian/test/fixtures/')[1]
      Then -> expect.chain(@files).to.contain('foo.js').andTo.contain('bar.js').andTo.contain('baz/quux.js').test()

    describe 'with filters', ->
      When -> @files = @pedestrian.walk './fixtures', ['*.js']
      And -> @files = @files.map (file) -> return file.split('pedestrian/test/fixtures/')[1]
      Then -> expect.chain(@files).to.contain('foo.js').andTo.contain('bar.js').test()
