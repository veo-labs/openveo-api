'use strict';

/**
 * The list of API HTTP errors with, for each error, its associated hexadecimal code and HTTP return code.
 *
 * @module http-errors
 * @main http-errors
 */
module.exports = {

  // Server errors
  GET_ENTITIES_ERROR: {
    code: 0x000,
    httpCode: 500,
    module: 'api'
  },
  GET_ENTITY_ERROR: {
    code: 0x001,
    httpCode: 500,
    module: 'api'
  },
  UPDATE_ENTITY_ERROR: {
    code: 0x002,
    httpCode: 500,
    module: 'api'
  },
  ADD_ENTITY_ERROR: {
    code: 0x003,
    httpCode: 500,
    module: 'api'
  },
  REMOVE_ENTITY_ERROR: {
    code: 0x004,
    httpCode: 500,
    module: 'api'
  },

  // Not found errors
  GET_ENTITY_NOT_FOUND: {
    code: 0x100,
    httpCode: 404,
    module: 'api'
  },

  // Authentication errors
  GET_ENTITIES_FORBIDDEN: {
    code: 0x200,
    httpCode: 403,
    module: 'api'
  },
  GET_ENTITY_FORBIDDEN: {
    code: 0x201,
    httpCode: 403,
    module: 'api'
  },
  UPDATE_ENTITY_FORBIDDEN: {
    code: 0x202,
    httpCode: 403,
    module: 'api'
  },
  ADD_ENTITY_FORBIDDEN: {
    code: 0x203,
    httpCode: 403,
    module: 'api'
  },

  // Wrong parameters errors
  GET_ENTITY_MISSING_PARAMETERS: {
    code: 0x300,
    httpCode: 400,
    module: 'api'
  },
  UPDATE_ENTITY_MISSING_PARAMETERS: {
    code: 0x301,
    httpCode: 400,
    module: 'api'
  },
  ADD_ENTITY_MISSING_PARAMETERS: {
    code: 0x302,
    httpCode: 400,
    module: 'api'
  },
  REMOVE_ENTITY_MISSING_PARAMETERS: {
    code: 0x303,
    httpCode: 400,
    module: 'api'
  }

};
