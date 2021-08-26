'use strict';

/**
 * @module controllers/httpErrors
 */

/**
 * The list of common HTTP errors with, for each error, its associated hexadecimal code and HTTP return code.
 *
 * @example
 * var HTTP_ERRORS = require('@openveo/api').controllers.httpErrors;
 *
 * @namespace
 */
var HTTP_ERRORS = {

  // Server errors

  /**
   * A server error occurring when getting a list of entities.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_ENTITIES_ERROR: {
    code: 0x000,
    httpCode: 500,
    module: 'api'
  },

  /**
   * A server error occurring when getting an entity.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_ENTITY_ERROR: {
    code: 0x001,
    httpCode: 500,
    module: 'api'
  },

  /**
   * A server error occurring when updating an entity.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  UPDATE_ENTITY_ERROR: {
    code: 0x002,
    httpCode: 500,
    module: 'api'
  },

  /**
   * A server error occurring when adding entities.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  ADD_ENTITIES_ERROR: {
    code: 0x003,
    httpCode: 500,
    module: 'api'
  },

  /**
   * A server error occurring when removing an entity.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  REMOVE_ENTITIES_ERROR: {
    code: 0x004,
    httpCode: 500,
    module: 'api'
  },

  /**
   * Updating entity failed when getting the entity.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  UPDATE_ENTITY_GET_ONE_ERROR: {
    code: 0x005,
    httpCode: 500,
    module: 'api'
  },

  // Not found errors

  /**
   * A not found error occurring when an entity couldn't be found.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_ENTITY_NOT_FOUND: {
    code: 0x100,
    httpCode: 404,
    module: 'api'
  },

  /**
   * Entity was not found when trying to update it.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  UPDATE_ENTITY_NOT_FOUND_ERROR: {
    code: 0x101,
    httpCode: 404,
    module: 'api'
  },

  // Authentication errors

  /**
   * An authentication error occurring when the connected user doesn't have enough privileges to remove entities.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  REMOVE_ENTITIES_FORBIDDEN: {
    code: 0x200,
    httpCode: 403,
    module: 'api'
  },

  /**
   * An authentication error occurring when the connected user doesn't have enough privileges to get an entity.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_ENTITY_FORBIDDEN: {
    code: 0x201,
    httpCode: 403,
    module: 'api'
  },

  /**
   * An authentication error occurring when the connected user doesn't have enough privileges to update an entity.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  UPDATE_ENTITY_FORBIDDEN: {
    code: 0x202,
    httpCode: 403,
    module: 'api'
  },

  // Wrong parameters errors

  /**
   * A wrong parameters error occurring when a parameter is missing while getting an entity.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_ENTITY_MISSING_PARAMETERS: {
    code: 0x300,
    httpCode: 400,
    module: 'api'
  },

  /**
   * A wrong parameters error occurring when a parameter is missing while updating an entity.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  UPDATE_ENTITY_MISSING_PARAMETERS: {
    code: 0x301,
    httpCode: 400,
    module: 'api'
  },

  /**
   * A wrong parameters error occurring when a parameter is missing while adding entities.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  ADD_ENTITIES_MISSING_PARAMETERS: {
    code: 0x302,
    httpCode: 400,
    module: 'api'
  },

  /**
   * A wrong parameters error occurring when a parameter is missing while removing entities.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  REMOVE_ENTITIES_MISSING_PARAMETERS: {
    code: 0x303,
    httpCode: 400,
    module: 'api'
  },

  /**
   * Getting the list of entities failed, wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_ENTITIES_WRONG_PARAMETERS: {
    code: 0x304,
    httpCode: 400,
    module: 'api'
  },

  /**
   * Getting an entity failed, wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  GET_ENTITY_WRONG_PARAMETERS: {
    code: 0x305,
    httpCode: 400,
    module: 'api'
  },

  /**
   * Adding entities failed, wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  ADD_ENTITIES_WRONG_PARAMETERS: {
    code: 0x306,
    httpCode: 400,
    module: 'api'
  },

  /**
   * Updating entity failed, wrong parameters.
   *
   * @const
   * @type {Object}
   * @default
   * @inner
   */
  UPDATE_ENTITY_WRONG_PARAMETERS: {
    code: 0x307,
    httpCode: 400,
    module: 'api'
  }

};

Object.freeze(HTTP_ERRORS);
module.exports = HTTP_ERRORS;
