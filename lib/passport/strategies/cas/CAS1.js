'use strict';

/**
 * @module passport/cas/CAS1
 * @ignore
 */

const CAS = require('./CAS.js');

/**
 * Defines a cas client interfacing with cas protocol 1.0.
 *
 * @extends module:passport/cas/CAS~CAS
 * @ignore
 */
class CAS1 extends CAS {

  /**
   * Gets validate uri.
   *
   * @return {String} The validate uri
   */
  getValidateUri() {
    return '/validate';
  }

  /**
   * Analyzes the validate ticket response from cas server.
   *
   * @param {String} response Validate ticket response from cas server
   * @param {module:passport/cas/CAS1~CAS1~analyzeValidateTicketResponseCallback} callback Function to call when
   * analyzed
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

/**
 * @callback module:passport/cas/CAS1~CAS1~analyzeValidateTicketResponseCallback
 * @param {(Error|null)} error An error if authentication failed or something went wrong, null otherwise
 * @param {(String|Undefined)} content Success response content
 */
