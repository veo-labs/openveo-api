'use strict';

/**
 * @module controllers
 */

/**
 * The list of common HTTP errors with, for each error, its associated hexadecimal code and HTTP return code.
 *
 *     var HTTP_ERRORS = require('@openveo/api').controllers.httpErrors;
 *
 * @class http-errors
 * @static
 */
var HTTP_ERRORS = {

  // Server errors

  /**
   * A server error occurring when getting a list of entities.
   *
   * @property GET_ENTITIES_ERROR
   * @type Object
   * @final
   */
  GET_ENTITIES_ERROR: {
    code: 0x000,
    httpCode: 500,
    module: 'api'
  },

  /**
   * A server error occurring when getting an entity.
   *
   * @property GET_ENTITY_ERROR
   * @type Object
   * @final
   */
  GET_ENTITY_ERROR: {
    code: 0x001,
    httpCode: 500,
    module: 'api'
  },

  /**
   * A server error occurring when updating an entity.
   *
   * @property UPDATE_ENTITY_ERROR
   * @type Object
   * @final
   */
  UPDATE_ENTITY_ERROR: {
    code: 0x002,
    httpCode: 500,
    module: 'api'
  },

  /**
   * A server error occurring when adding an entity.
   *
   * @property ADD_ENTITY_ERROR
   * @type Object
   * @final
   */
  ADD_ENTITY_ERROR: {
    code: 0x003,
    httpCode: 500,
    module: 'api'
  },

  /**
   * A server error occurring when removing an entity.
   *
   * @property REMOVE_ENTITY_ERROR
   * @type Object
   * @final
   */
  REMOVE_ENTITY_ERROR: {
    code: 0x004,
    httpCode: 500,
    module: 'api'
  },

  // Not found errors

  /**
   * A not found error occurring when an entity couldn't be found.
   *
   * @property GET_ENTITY_NOT_FOUND
   * @type Object
   * @final
   */
  GET_ENTITY_NOT_FOUND: {
    code: 0x100,
    httpCode: 404,
    module: 'api'
  },

  // Authentication errors

  /**
   * An authentication error occurring when the connected user doesn't have enough privileges
   * to get the list of entities.
   *
   * @property GET_ENTITIES_FORBIDDEN
   * @type Object
   * @final
   */
  GET_ENTITIES_FORBIDDEN: {
    code: 0x200,
    httpCode: 403,
    module: 'api'
  },

  /**
   * An authentication error occurring when the connected user doesn't have enough privileges to get an entity.
   *
   * @property GET_ENTITY_FORBIDDEN
   * @type Object
   * @final
   */
  GET_ENTITY_FORBIDDEN: {
    code: 0x201,
    httpCode: 403,
    module: 'api'
  },

  /**
   * An authentication error occurring when the connected user doesn't have enough privileges to update an entity.
   *
   * @property UPDATE_ENTITY_FORBIDDEN
   * @type Object
   * @final
   */
  UPDATE_ENTITY_FORBIDDEN: {
    code: 0x202,
    httpCode: 403,
    module: 'api'
  },

  /**
   * An authentication error occurring when the connected user doesn't have enough privileges to add an entity.
   *
   * @property ADD_ENTITY_FORBIDDEN
   * @type Object
   * @final
   */
  ADD_ENTITY_FORBIDDEN: {
    code: 0x203,
    httpCode: 403,
    module: 'api'
  },

  // Wrong parameters errors

  /**
   * A wrong parameter error occurring when a parameter is missing while getting an entity.
   *
   * @property GET_ENTITY_MISSING_PARAMETERS
   * @type Object
   * @final
   */
  GET_ENTITY_MISSING_PARAMETERS: {
    code: 0x300,
    httpCode: 400,
    module: 'api'
  },

  /**
   * A wrong parameter error occurring when a parameter is missing while updating an entity.
   *
   * @property UPDATE_ENTITY_MISSING_PARAMETERS
   * @type Object
   * @final
   */
  UPDATE_ENTITY_MISSING_PARAMETERS: {
    code: 0x301,
    httpCode: 400,
    module: 'api'
  },

  /**
   * A wrong parameter error occurring when a parameter is missing while adding an entity.
   *
   * @property ADD_ENTITY_MISSING_PARAMETERS
   * @type Object
   * @final
   */
  ADD_ENTITY_MISSING_PARAMETERS: {
    code: 0x302,
    httpCode: 400,
    module: 'api'
  },

  /**
   * A wrong parameter error occurring when a parameter is missing while removing an entity.
   *
   * @property REMOVE_ENTITY_MISSING_PARAMETERS
   * @type Object
   * @final
   */
  REMOVE_ENTITY_MISSING_PARAMETERS: {
    code: 0x303,
    httpCode: 400,
    module: 'api'
  }

};

Object.freeze(HTTP_ERRORS);
module.exports = HTTP_ERRORS;
