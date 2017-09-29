'use strict';

/**
 * @module passport
 */

const CAS = require('./CAS.js');

/**
 * Defines a cas client interfacing with cas protocol 1.0.
 *
 * @class CAS1
 * @extends CAS
 * @constructor
 */
class CAS1 extends CAS {

  /**
   * Gets validate uri.
   *
   * @method getValidateUri
   * @return {String} The validate uri
   */
  getValidateUri() {
    return '/validate';
  }

  /**
   * Analyzes the validate ticket response from cas server.
   *
   * @async
   * @method analyzeValidateTicketResponse
   * @param {String} response Validate ticket response from cas server
   * @param {Function} callback Function to call when analyzed with :
   *  - **Error** An error if authentication failed or something went wrong, null otherwise
   *  - **String** Success response content
   */
  analyzeValidateTicketResponse(response, callback) {
    const lines = response.split('\n');
    if (lines[0] === 'yes' && lines.length >= 2)
      return callback(null, lines[1]);
    else if (lines[0] === 'no')
      return callback(new Error('CAS authentication failed.'));
    else
      return callback(new Error('Response from CAS server was bad.'));
  }

}

module.exports = CAS1;
