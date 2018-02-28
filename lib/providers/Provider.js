'use strict';

/**
 * @module providers
 */

var Storage = process.requireApi('lib/storages/Storage.js');

/**
 * Defines the base provider for all providers.
 *
 * A provider manages resources from its associated storage.
 *
 * @class Provider
 * @constructor
 * @param {Storage} storage The storage to use to store provider resources
 * @throws {TypeError} If storage is not valid
 */
function Provider(storage) {
  Object.defineProperties(this, {

    /**
     * The provider storage.
     *
     * @property storage
     * @type Storage
     * @final
     */
    storage: {value: storage}

  });

  if (!(this.storage instanceof Storage))
    throw new TypeError('storage must be of type Storage');
}

module.exports = Provider;

/**
 * Executes the given callback or log the error message if no callback specified.
 *
 * It assumes that the second argument is the error. All arguments, except the callback itself, will be specified
 * as arguments when executing the callback.
 *
 * @method executeCallback
 * @param {Function} [callback] The function to execute
 * @param {Error} [error] An eventual error to pass to the callback
 * @param {Function} [callback] The function to call, if not specified the error is logged
 */
Provider.prototype.executeCallback = function() {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.shift();
  var error = args[0];

  if (callback) return callback.apply(null, args);
  if (error instanceof Error)
    process.logger.error('An error occured while executing callback with message: ' + error.message);
};
