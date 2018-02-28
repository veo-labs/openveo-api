'use strict';

/**
 * @module storages
 */

/**
 * The list of common database errors with, for each error, its associated hexadecimal code.
 *
 *     var DATABASE_ERRORS = require('@openveo/api').storages.databaseErrors;
 *
 * @class database-errors
 * @static
 */
var DATABASE_ERRORS = {

  /**
   * An error occurring when renaming a collection which does not exist.
   *
   * @property RENAME_COLLECTION_NOT_FOUND_ERROR
   * @type Object
   * @final
   */
  RENAME_COLLECTION_NOT_FOUND_ERROR: {
    code: 0x000
  },

  /**
   * An error occurring when removing a collection which does not exist.
   *
   * @property REMOVE_COLLECTION_NOT_FOUND_ERROR
   * @type Object
   * @final
   */
  REMOVE_COLLECTION_NOT_FOUND_ERROR: {
    code: 0x001
  }

};

Object.freeze(DATABASE_ERRORS);
module.exports = DATABASE_ERRORS;
