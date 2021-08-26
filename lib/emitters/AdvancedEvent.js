'use strict';

/**
 * @module emitters/AdvancedEvent
 */

/**
 * Defines an AdvancedEvent to work with an AdvancedEmitter.
 *
 * It duplicates the name argument to have twice the event's name
 * as first and second arguments.
 *
 * @class AdvancedEvent
 * @constructor
 * @param {String} name The event's name
 * @param {...*} [args] Any number of arguments
 */
function AdvancedEvent() {

  // Transform arguments into an array
  var args = Array.prototype.slice.call(arguments);

  // Duplicate "name" argument to have twice the event's name
  // as first and second arguments
  args.unshift(arguments[0]);

  Object.defineProperties(this,

    /** @lends module:emitters/AdvancedEvent~AdvancedEvent */
    {

      /**
       * The list of event's arguments.
       *
       * @type {Array}
       * @instance
       * @readonly
       */
      arguments: {value: args}

    }

  );
}

module.exports = AdvancedEvent;
