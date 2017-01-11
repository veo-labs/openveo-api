'use strict';

var chai = require('chai');
var spies = require('chai-spies');
var SocketNamespace = process.requireApi('lib/socket/SocketNamespace.js');
var assert = chai.assert;

chai.should();
chai.use(spies);

// SocketNamespace.js
describe('SocketNamespace', function() {
  var socketNamespace;
  var namespace;

  // Mocks
  beforeEach(function() {
    namespace = {
      on: function() {},
      use: function() {}
    };
  });

  // Prepare tests
  beforeEach(function() {
    socketNamespace = new SocketNamespace();
  });

  // handlers property
  describe('handlers', function() {

    it('should not be editable', function() {
      assert.throws(function() {
        socketNamespace.handlers = null;
      });
    });

  });

  // middlewares property
  describe('middlewares', function() {

    it('should not be editable', function() {
      assert.throws(function() {
        socketNamespace.middlewares = null;
      });
    });

  });

  // namespace property
  describe('namespace', function() {

    it('should mount handlers and middlewares when modifying the namespace', function() {
      var expectedMessage = 'message';
      var expectedHandler = function() {};
      var expectedMiddleware = function() {};
      namespace.on = chai.spy(namespace.on);
      namespace.use = chai.spy(namespace.use);
      socketNamespace.on(expectedMessage, expectedHandler);
      socketNamespace.use(expectedMiddleware);
      socketNamespace.namespace = namespace;

      namespace.on.should.have.been.called.with.exactly(expectedMessage, expectedHandler);
      namespace.use.should.have.been.called.with.exactly(expectedMiddleware);
    });

  });

  // on method
  describe('on', function() {

    it('should be able to add a message\'s handler', function() {
      var expectedMessage = 'message';
      var expectedHandler = function() {};
      socketNamespace.on(expectedMessage, expectedHandler);
      assert.equal(socketNamespace.handlers[expectedMessage].length, 1, 'Unexpected number of handlers');
      assert.strictEqual(socketNamespace.handlers[expectedMessage][0], expectedHandler, 'Unexpected handler');
    });

    it('should be able to add several handlers for a message', function() {
      var expectedMessage = 'message';
      socketNamespace.on(expectedMessage, function() {});
      socketNamespace.on(expectedMessage, function() {});
      assert.equal(socketNamespace.handlers[expectedMessage].length, 2);
    });

    it('should add listener to the namespace if a namespace is already available', function() {
      namespace.on = chai.spy(namespace.on);
      socketNamespace.namespace = namespace;
      socketNamespace.on('message', function() {});

      namespace.on.should.have.been.called.exactly(1);
    });

    it('should not be able to add a message\s handler if message id is not a string', function() {
      var values = [undefined, null, 0, {}, function() {}];

      values.forEach(function(value) {
        socketNamespace.on(value, function() {});
        assert.equal(Object.keys(socketNamespace.handlers), 0);
      });
    });

    it('should not be able to add a message\s handler if handler is not a function', function() {
      var values = [undefined, null, 0, {}, 'string'];

      values.forEach(function(value) {
        socketNamespace.on('message', value);
        assert.equal(Object.keys(socketNamespace.handlers), 0);
      });
    });

  });

  // use method
  describe('use', function() {

    it('should be able to add a middleware', function() {
      var expectedMiddleware = function() {};
      socketNamespace.use(expectedMiddleware);
      assert.strictEqual(socketNamespace.middlewares[0], expectedMiddleware);
    });

    it('should add middleware to the namespace if a namespace is already available', function() {
      namespace.use = chai.spy(namespace.use);
      socketNamespace.namespace = namespace;
      socketNamespace.use(function() {});

      namespace.use.should.have.been.called.exactly(1);
    });

    it('should not be able to add a middleware if is not a function', function() {
      var values = [undefined, null, 0, {}, 'string'];

      values.forEach(function(value) {
        socketNamespace.use(value);
        assert.equal(socketNamespace.middlewares, 0);
      });
    });

  });

  // emit method
  describe('emit', function() {

    it('should be able to emit a message to the whole namespace', function() {
      var expectedMessage = 'message';
      var expectedData = {};
      namespace.emit = chai.spy(namespace.emit);
      socketNamespace.namespace = namespace;
      socketNamespace.emit(expectedMessage, expectedData);

      namespace.emit.should.have.been.called.with.exactly(expectedMessage, expectedData);
    });

  });

});
