describe 'acceptance', ->
  Given -> @subject = require '../lib/kindly'

  context 'sync', ->
    When -> @descriptors = @subject.get('test/fixtures')
    Then -> expect(@descriptors.files).to.contain 'test/fixtures/baz.quux'
    And -> expect(@descriptors.files).to.contain 'test/fixtures/foo.bar'

  context 'async', ->
    When (done) -> @subject.get 'test/fixtures', (err, @descriptors) => done()
    Then -> expect(@descriptors.files).to.contain 'test/fixtures/baz.quux'
    And -> expect(@descriptors.files).to.contain 'test/fixtures/foo.bar'
