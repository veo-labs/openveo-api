'use strict';

/**
 * The list of API HTTP errors with, for each error, its associated hexadecimal code and HTTP return code.
 *
 * @module http-errors
 * @main http-errors
 */
module.exports = {

  // Authentication errors
  GET_ENTITIES_FORBIDDEN: {
    code: 0x000,
    httpCode: 403,
    module: 'api'
  },
  GET_ENTITY_FORBIDDEN: {
    code: 0x001,
    httpCode: 403,
    module: 'api'
  },
  UPDATE_ENTITY_FORBIDDEN: {
    code: 0x002,
    httpCode: 403,
    module: 'api'
  },
  ADD_ENTITY_FORBIDDEN: {
    code: 0x003,
    httpCode: 403,
    module: 'api'
  },

  // Missing parameters errors
  GET_ENTITY_MISSING_PARAMETERS: {
    code: 0x100,
    httpCode: 400,
    module: 'api'
  },
  UPDATE_ENTITY_MISSING_PARAMETERS: {
    code: 0x101,
    httpCode: 400,
    module: 'api'
  },
  ADD_ENTITY_MISSING_PARAMETERS: {
    code: 0x102,
    httpCode: 400,
    module: 'api'
  },
  REMOVE_ENTITY_MISSING_PARAMETERS: {
    code: 0x103,
    httpCode: 400,
    module: 'api'
  },

  // Other errors
  GET_ENTITIES_ERROR: {
    code: 0x200,
    httpCode: 500,
    module: 'api'
  },
  GET_ENTITY_ERROR: {
    code: 0x201,
    httpCode: 500,
    module: 'api'
  },
  UPDATE_ENTITY_ERROR: {
    code: 0x202,
    httpCode: 500,
    module: 'api'
  },
  ADD_ENTITY_ERROR: {
    code: 0x203,
    httpCode: 500,
    module: 'api'
  },
  REMOVE_ENTITY_ERROR: {
    code: 0x204,
    httpCode: 500,
    module: 'api'
  }

};
