_ = require('underscore')
global.sinon = require('sinon')
global.expect = require('indeed').expect
global.sandbox = require('proxyquire')

global._ = _
_.mixin require('./../lib/mixins')

global.spyObj = (fns...) ->
  _(fns).reduce (obj, fn) ->
    obj[fn] = sinon.stub()
    obj
  , {}
