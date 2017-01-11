'use strict';

var assert = require('chai').assert;
var Pilot = process.requireApi('lib/socket/Pilot.js');
var SocketNamespace = process.requireApi('lib/socket/SocketNamespace.js');
var AdvancedEmitter = process.requireApi('lib/emitters/AdvancedEmitter.js');

// Pilot.js
describe('Pilot', function() {
  var pilot;

  // Prepare tests
  beforeEach(function() {
    pilot = new Pilot(new AdvancedEmitter(), new SocketNamespace());
  });

  // properties
  describe('properties', function() {

    it('should not be editable', function() {
      var properties = ['clientEmitter', 'clients', 'namespace'];

      properties.forEach(function(property) {
        assert.throws(function() {
          pilot[property] = null;
        }, null, null, 'Expected property "' + property + '" to be unalterable');
      });
    });

  });

  // addClient method
  describe('addClient', function() {

    it('should be able to add a client to connected clients', function() {
      var expectedId = 42;
      var expectedSocket = {};
      pilot.addClient(expectedId, expectedSocket);
      assert.isDefined(pilot.getClient(expectedId));
    });

    it('should not add client if no id', function() {
      pilot.addClient(null, {});
      assert.equal(pilot.clients.length, 0);
    });

    it('should not add client if no socket', function() {
      pilot.addClient(42);
      assert.equal(pilot.clients.length, 0);
    });

  });

  // getClientBySocketId
  describe('getClientBySocketId', function() {

    it('should be able to get a client by its socket id', function() {
      var expectedSocketId = 42;
      pilot.addClient(41, {id: expectedSocketId});
      assert.isDefined(pilot.getClientBySocketId(expectedSocketId));
    });

    it('should return null if not found', function() {
      assert.isNull(pilot.getClientBySocketId(42));
    });

  });

  // removeClientBySocketId
  describe('removeClientBySocketId', function() {

    it('should be able to remove a client by its socket id', function() {
      var expectedId = 41;
      var expectedSocketId = 42;
      pilot.addClient(expectedId, {id: expectedSocketId});
      pilot.removeClientBySocketId(expectedSocketId);
      assert.isNull(pilot.getClient(expectedId));
    });

    it('should return the removed client', function() {
      var expectedId = 41;
      var expectedSocketId = 42;
      pilot.addClient(expectedId, {id: expectedSocketId});
      var removedClient = pilot.removeClientBySocketId(expectedSocketId);
      assert.strictEqual(removedClient.id, expectedId);
    });

    it('should return null if not found', function() {
      assert.isNull(pilot.removeClientBySocketId(42));
    });

  });

  // emitMessageAsIs
  describe('emitMessageAsIs', function() {

    it('should emit a message using EventEmitter.emit with the same arguments', function(done) {
      var expectedMessage = 'message';
      var param1 = 'value1';
      pilot.on(expectedMessage, function(arg1) {
        assert.equal(arg1, param1);
        done();
      });
      pilot.emitMessageAsIs(expectedMessage, param1);
    });

  });

  // emitMessageWithId
  describe('emitMessageWithId', function() {

    it('should replace the socket by the associated client id', function(done) {
      var expectedMessage = 'message';
      var expectedId = 41;
      var expectedSocketId = 42;
      var expectedArg = 'value';
      pilot.addClient(expectedId, {id: expectedSocketId});
      pilot.on(expectedMessage, function(arg1, id, callback) {
        assert.equal(arg1, expectedArg);
        assert.equal(id, expectedId);
        done();
      });
      pilot.emitMessageWithId(expectedMessage, expectedArg, {id: expectedSocketId}, function() {});
    });

  });

});
