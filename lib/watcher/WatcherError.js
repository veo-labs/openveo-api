'use strict';

/**
 * @module watcher/WatcherError
 */

var util = require('util');

/**
 * Defines an error occurring while watching for directory changes.
 *
 * @class WatcherError
 * @extends Error
 * @constructor
 * @param {String} message The error message
 * @param {String} code The error code
 * @param {String} directoryPath The absolute path of the directory in error
 */
function WatcherError(message, code, directoryPath) {
  Error.captureStackTrace(this, this.constructor);

  Object.defineProperties(this,

    /** @lends module:watcher/WatcherError~WatcherError */
    {

      /**
       * The fs.FSWatcher's error code.
       *
       * @instance
       * @readonly
       * @type {String}
       */
      code: {value: code},

      /**
       * The absolute path of the watched directory the error belongs to.
       *
       * @instance
       * @readonly
       * @type {String}
       */
      directoryPath: {value: directoryPath},

      /**
       * Error message.
       *
       * @instance
       * @type {String}
       */
      message: {value: message, writable: true},

      /**
       * Error name.
       *
       * @instance
       * @type {String}
       */
      name: {value: 'WatcherError', writable: true}

    }

  );
}

module.exports = WatcherError;
util.inherits(WatcherError, Error);
