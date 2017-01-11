'use strict';

var assert = require('chai').assert;
var AdvancedEmitter = process.requireApi('lib/emitters/AdvancedEmitter.js');
var AdvancedEvent = process.requireApi('lib/emitters/AdvancedEvent.js');

// AdvancedEmitter.js
describe('AdvancedEmitter', function() {

  // emitEvent method
  describe('emitEvent', function() {

    it('should be able to emit an AdvancedEvent', function(done) {
      var emitter = new AdvancedEmitter();
      var eventName = 'test';
      var arg1 = 'arg1';
      var arg2 = 'arg2';

      emitter.on(eventName, function(name, value1, value2) {
        assert.equal(name, eventName, 'Unexpected event name');
        assert.equal(value1, arg1, 'Unexpected first argument');
        assert.equal(value2, arg2, 'Unexpected second argument');
        done();
      });

      emitter.emitEvent(new AdvancedEvent(eventName, arg1, arg2));
    });

  });

});
