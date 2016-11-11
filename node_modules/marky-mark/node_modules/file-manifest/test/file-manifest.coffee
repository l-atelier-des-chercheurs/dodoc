sinon = require('sinon')
expect = require('indeed').expect
path = require('path')

describe 'acceptance', ->
  Given -> @fm = require '../lib/file-manifest'

  describe 'sync', ->
    describe 'with relative dir', ->
      When -> @manifest = @fm.generate "./fixtures"
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'
        bazQuux: 'quux'
        blah: 'json'

    describe 'with dir', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures"
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'
        bazQuux: 'quux'
        blah: 'json'

    describe 'with dir and patterns as array', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures", ['*.js']
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'

    describe 'with multiple patterns', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures", ['**/*.js', '*.json', '!foo*']
      Then -> expect(@manifest).to.deep.equal
        bar: 'bar'
        blah: 'json'
        bazQuux: 'quux'

    describe 'with dir and patterns as string', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures", '*.js'
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'

    describe 'with dir and reducer', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures", (options, manifest, file) ->
        manifest[file.name] = require(file.fullPath).split('').reverse().join('')
        return manifest
      Then -> expect(@manifest).to.deep.equal
        foo: 'oof'
        bar: 'rab'
        quux: 'xuuq'
        blah: 'nosj'

    describe 'with dir, patterns, and reducer', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures", ['*.js'], (options, manifest, file) ->
        manifest[file.name] = require(file.fullPath).split('').reverse().join('')
        return manifest
      Then -> expect(@manifest).to.deep.equal
        foo: 'oof'
        bar: 'rab'

    describe 'with dir and options.patterns as array', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures", { patterns: ['*.js'] }
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'

    describe 'with dir and options.patterns as string', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures", { patterns: '*.js' }
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'

    describe 'with dir and options.memo', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures", { memo: { hello: 'world' } }
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'
        bazQuux: 'quux'
        blah: 'json'
        hello: 'world'

    describe 'with dir and options.reducer', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures",
        reducer: (options, manifest, file) ->
          manifest[file.name] = require(file.fullPath).split('').reverse().join('')
          return manifest
      Then -> expect(@manifest).to.deep.equal
        foo: 'oof'
        bar: 'rab'
        quux: 'xuuq'
        blah: 'nosj'

    describe 'with dir and options.namer as function', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures",
        namer: (options, file) -> file.name.split('').reverse().join('')
      Then -> expect(@manifest).to.deep.equal
        oof: 'foo'
        rab: 'bar'
        xuuq: 'quux'
        halb: 'json'

    describe 'with dir and options.namer as string', ->
      context 'camelCase', ->
        When -> @manifest = @fm.generate "#{__dirname}/fixtures", { namer: 'camelCase' }
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          bazQuux: 'quux'

      context 'dash', ->
        When -> @manifest = @fm.generate "#{__dirname}/fixtures", { namer: 'dash' }
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          'baz-quux': 'quux'

      context 'slash', ->
        When -> @manifest = @fm.generate "#{__dirname}/fixtures", { namer: 'slash' }
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          'baz/quux': 'quux'

      context 'pipe', ->
        When -> @manifest = @fm.generate "#{__dirname}/fixtures", { namer: 'pipe' }
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          'baz|quux': 'quux'

      context 'class', ->
        When -> @manifest = @fm.generate "#{__dirname}/fixtures", { namer: 'class' }
        Then -> expect(@manifest).to.deep.equal
          Foo: 'foo'
          Bar: 'bar'
          Blah: 'json'
          BazQuux: 'quux'

      context 'lower', ->
        When -> @manifest = @fm.generate "#{__dirname}/fixtures", { namer: 'lower' }
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          bazquux: 'quux'

      context 'upper', ->
        When -> @manifest = @fm.generate "#{__dirname}/fixtures", { namer: 'upper' }
        Then -> expect(@manifest).to.deep.equal
          FOO: 'foo'
          BAR: 'bar'
          BLAH: 'json'
          BAZQUUX: 'quux'

      context 'underscore', ->
        When -> @manifest = @fm.generate "#{__dirname}/fixtures", { namer: 'underscore' }
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          baz_quux: 'quux'

      context 'human', ->
        When -> @manifest = @fm.generate "#{__dirname}/fixtures", { namer: 'human' }
        Then -> expect(@manifest).to.deep.equal
          Foo: 'foo'
          Bar: 'bar'
          Blah: 'json'
          'Baz quux': 'quux'

    describe 'with dir and options.require as function', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures",
        require: (options, file) -> file.ext
      Then -> expect(@manifest).to.deep.equal
        foo: '.js'
        bar: '.js'
        blah: '.json'
        bazQuux: '.js'

    describe 'with dir and options.require as string', ->
      context 'require', ->
        When -> @manifest = @fm.generate "#{__dirname}/fixtures", { require: 'require' }
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          bazQuux: 'quux'

      context 'readfile', ->
        When -> @manifest = @fm.generate "#{__dirname}/fixtures", { require: 'readFile' }
        Then -> expect(@manifest).to.deep.equal
          foo: 'module.exports = \'foo\';\n'
          bar: 'module.exports = \'bar\';\n'
          blah: '"json"\n'
          bazQuux: 'module.exports = \'quux\';\n'

    describe 'with dir, options.memo, and reducer', ->
      When -> @manifest = @fm.generate "#{__dirname}/fixtures",
        memo:
          a: []
          b: []
      , (options, manifest, file) -> manifest.b.push(file.name); return manifest
      And -> @manifest.b.sort()
      Then -> expect(@manifest).to.deep.equal
        a: []
        b: ['bar', 'blah', 'foo', 'quux']

  describe 'async', ->
    describe 'with a relative dir', ->
      When (done) -> @fm.generate "./fixtures", (err, @manifest) => done()
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'
        blah: 'json'
        bazQuux: 'quux'

    describe 'with dir', ->
      When (done) -> @fm.generate "#{__dirname}/fixtures", (err, @manifest) => done()
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'
        blah: 'json'
        bazQuux: 'quux'

    describe 'with dir and patterns', ->
      When (done) -> @fm.generate "#{__dirname}/fixtures", ['*.js'], (err, @manifest) => done()
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'

    describe 'with dir and reducer', ->
      When (done) -> @fm.generate "#{__dirname}/fixtures", ((options, manifest, file, cb) ->
        manifest[file.name] = require(file.fullPath).split('').reverse().join('')
        cb(null, manifest)
      ), (err, @manifest) => done()
      Then -> expect(@manifest).to.deep.equal
        foo: 'oof'
        bar: 'rab'
        quux: 'xuuq'
        blah: 'nosj'

    describe 'with dir, patterns, and reducer', ->
      When (done) -> @fm.generate "#{__dirname}/fixtures", ['*.js'], ((options, manifest, file, cb) ->
        manifest[file.name] = require(file.fullPath).split('').reverse().join('')
        cb(null, manifest)
      ), (err, @manifest) => done()
      Then -> expect(@manifest).to.deep.equal
        foo: 'oof'
        bar: 'rab'

    describe 'with dir and options.patterns as array', ->
      When (done) -> @fm.generate "#{__dirname}/fixtures", { patterns: ['*.js'] }, (err, @manifest) => done()
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'

    describe 'with dir and options.patterns as string', ->
      When (done) -> @fm.generate "#{__dirname}/fixtures", { patterns: '*.js' }, (err, @manifest) => done()
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'

    describe 'with dir and options.memo', ->
      When (done) -> @fm.generate "#{__dirname}/fixtures", { memo: { hello: 'world' } }, (err, @manifest) => done()
      Then -> expect(@manifest).to.deep.equal
        foo: 'foo'
        bar: 'bar'
        blah: 'json'
        bazQuux: 'quux'
        hello: 'world'

    describe 'with dir and options.reducer', ->
      When (done) -> @fm.generate "#{__dirname}/fixtures",
        reducer: (options, manifest, file, cb) ->
          manifest[file.name] = require(file.fullPath).split('').reverse().join('')
          cb(null, manifest)
      , (err, @manifest) => done()
      Then -> expect(@manifest).to.deep.equal
        foo: 'oof'
        bar: 'rab'
        blah: 'nosj'
        quux: 'xuuq'

    describe 'with dir and options.namer as function', ->
      When (done) -> @fm.generate "#{__dirname}/fixtures",
        namer: (options, file) -> file.name.split('').reverse().join('')
      , (err, @manifest) => done()
      Then -> expect(@manifest).to.deep.equal
        oof: 'foo'
        rab: 'bar'
        halb: 'json'
        xuuq: 'quux'

    describe 'with dir and options.namer as string', ->
      context 'camelCase', ->
        When (done) -> @fm.generate "#{__dirname}/fixtures", { namer: 'camelCase' }, (err, @manifest) => done()
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          bazQuux: 'quux'

      context 'dash', ->
        When (done) -> @fm.generate "#{__dirname}/fixtures", { namer: 'dash' }, (err, @manifest) => done()
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          'baz-quux': 'quux'

      context 'slash', ->
        When (done) -> @fm.generate "#{__dirname}/fixtures", { namer: 'slash' }, (err, @manifest) => done()
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          'baz/quux': 'quux'

      context 'pipe', ->
        When (done) -> @fm.generate "#{__dirname}/fixtures", { namer: 'pipe' }, (err, @manifest) => done()
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          'baz|quux': 'quux'

      context 'class', ->
        When (done) -> @fm.generate "#{__dirname}/fixtures", { namer: 'class' }, (err, @manifest) => done()
        Then -> expect(@manifest).to.deep.equal
          Foo: 'foo'
          Bar: 'bar'
          Blah: 'json'
          BazQuux: 'quux'

      context 'lower', ->
        When (done) -> @fm.generate "#{__dirname}/fixtures", { namer: 'lower' }, (err, @manifest) => done()
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          bazquux: 'quux'

      context 'upper', ->
        When (done) -> @fm.generate "#{__dirname}/fixtures", { namer: 'upper' }, (err, @manifest) => done()
        Then -> expect(@manifest).to.deep.equal
          FOO: 'foo'
          BAR: 'bar'
          BLAH: 'json'
          BAZQUUX: 'quux'

      context 'underscore', ->
        When (done) -> @fm.generate "#{__dirname}/fixtures", { namer: 'underscore' }, (err, @manifest) => done()
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          baz_quux: 'quux'

      context 'human', ->
        When (done) -> @fm.generate "#{__dirname}/fixtures", { namer: 'human' }, (err, @manifest) => done()
        Then -> expect(@manifest).to.deep.equal
          Foo: 'foo'
          Bar: 'bar'
          Blah: 'json'
          'Baz quux': 'quux'

    describe 'with dir and options.require as function', ->
      When (done) -> @fm.generate "#{__dirname}/fixtures",
        require: (options, file, cb) -> cb(null, file.ext)
      , (err, @manifest) => done()
      Then -> expect(@manifest).to.deep.equal
        foo: '.js'
        bar: '.js'
        blah: '.json'
        bazQuux: '.js'

    describe 'with dir and options.require as string', ->
      context 'require', ->
        When (done) -> @fm.generate "#{__dirname}/fixtures", { require: 'require' }, (err, @manifest) => done()
        Then -> expect(@manifest).to.deep.equal
          foo: 'foo'
          bar: 'bar'
          blah: 'json'
          bazQuux: 'quux'

      context 'readfile', ->
        When (done) -> @fm.generate "#{__dirname}/fixtures", { require: 'readFile' }, (err, @manifest) => done()
        Then -> expect(@manifest).to.deep.equal
          foo: 'module.exports = \'foo\';\n'
          bar: 'module.exports = \'bar\';\n'
          blah: '"json"\n'
          bazQuux: 'module.exports = \'quux\';\n'

    describe 'with dir, options.memo, and reducer', ->
      When (done) -> @fm.generate "#{__dirname}/fixtures",
        memo:
          a: []
          b: []
      , (options, manifest, file, cb) ->
        manifest.b.push(file.name)
        cb(null, manifest)
      , (err, @manifest) => done()
      And -> @manifest.b.sort()
      Then -> expect(@manifest).to.deep.equal
        a: []
        b: ['bar', 'blah', 'foo', 'quux']
