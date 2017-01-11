'use strict';

var util = require('util');
var assert = require('chai').assert;
var SocketController = process.requireApi('lib/controllers/SocketController.js');
var SocketNamespace = process.requireApi('lib/socket/SocketNamespace.js');

// SocketController.js
describe('SocketController', function() {
  var TestSocketController;
  var testSocketController;
  var namespace;

  // Mocks
  beforeEach(function() {
    TestSocketController = function(ModelConstructor, ProviderConstructor) {
      TestSocketController.super_.call(this, ModelConstructor, ProviderConstructor);
    };

    util.inherits(TestSocketController, SocketController);
  });

  // Prepare tests using mocks
  beforeEach(function() {
    namespace = new SocketNamespace();
    testSocketController = new TestSocketController(namespace);
  });

  // namespace property
  describe('namespace', function() {

    it('should not be editable', function() {
      assert.throws(function() {
        testSocketController.namespace = null;
      });
    });

  });

  // emitter property
  describe('emitter', function() {

    it('should not be editable', function() {
      assert.throws(function() {
        testSocketController.emitter = null;
      });
    });

  });

});
