'use strict';

/**
 * @module emitters
 */

var events = require('events');
var util = require('util');
var AdvancedEvent = process.requireApi('lib/emitters/AdvancedEvent.js');

/**
 * Defines an AdvancedEmitter which wraps an EventEmitter.
 *
 * An AdvancedEmitter works pretty much the same as the default Node.js EventEmitter
 * excepts that it adds a new method to emit an AdvancedEvent to have the event's name
 * as the first argument of the handler function.
 *
 * It helps emit an event with the name of the event as the first argument.
 *
 *     var AdvancedEmitter = require('@openveo/api').emitters.AdvancedEmitter;
 *     var AdvancedEvent = require('@openveo/api').emitters.AdvancedEvent;
 *
 *     var emitter = new AdvancedEmitter();
 *     emitter.emitEvent(new AdvancedEvent('eventName', param1, param2, ...));
 *
 *     emitter.on('eventName', function(eventName, param1, param2, ...) {
 *       console.log(eventName); // Output "eventName"
 *     });
 *
 * @class AdvancedEmitter
 * @extends EventEmitter
 * @constructor
 */
function AdvancedEmitter() {
  AdvancedEmitter.super_.call(this);
}

module.exports = AdvancedEmitter;
util.inherits(AdvancedEmitter, events.EventEmitter);

/**
 * Emits an AdvancedEvent by emitting its constructor's arguments.
 *
 * @method emitEvent
 * @param {AdvancedEvent} event The advanced event to emit
 */
AdvancedEmitter.prototype.emitEvent = function(event) {
  if (event instanceof AdvancedEvent)
    this.emit.apply(this, event.arguments);
};
