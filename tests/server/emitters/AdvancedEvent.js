'use strict';

var assert = require('chai').assert;
var AdvancedEvent = process.requireApi('lib/emitters/AdvancedEvent.js');

// AdvancedEvent.js
describe('AdvancedEvent', function() {

  // arguments property
  describe('arguments', function() {

    it('should be able to duplicate the event name', function() {
      var eventName = 'eventName';
      var arg1 = 'value1';
      var arg2 = 'value2';
      var event = new AdvancedEvent(eventName, arg1, arg2);

      assert.equal(event.arguments[0], eventName, 'Expected event name as first argument');
      assert.equal(event.arguments[1], eventName, 'Expected event name as second argument');
      assert.equal(event.arguments[2], arg1, 'Expected arg1 as third argument');
      assert.equal(event.arguments[3], arg2, 'Expected arg2 as fourth argument');
    });

  });

});
