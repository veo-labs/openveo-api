'use strict';

/**
 * @module storages/DATABASE_ERRORS
 */

/**
 * The list of common database errors with, for each error, its associated hexadecimal code.
 *
 * @example
 * var DATABASE_ERRORS = require('@openveo/api').storages.databaseErrors;
 *
 * @namespace
 * @ignore
 */
var DATABASE_ERRORS = {

  /**
   * An error occurring when renaming a collection which does not exist.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  RENAME_COLLECTION_NOT_FOUND_ERROR: {
    code: 0x000
  },

  /**
   * An error occurring when removing a collection which does not exist.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  REMOVE_COLLECTION_NOT_FOUND_ERROR: {
    code: 0x001
  },

  /**
   * An error occurring when an unsupported ResourceFilter operation is used.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  BUILD_FILTERS_UNKNOWN_OPERATION_ERROR: {
    code: 0x002
  }

};

Object.freeze(DATABASE_ERRORS);
module.exports = DATABASE_ERRORS;
