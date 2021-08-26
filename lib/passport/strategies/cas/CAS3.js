'use strict';

/**
 * @module passport/cas/CAS3
 * @ignore
 */

const CAS = require('./CAS.js');

/**
 * Defines a cas client interfacing with cas protocol 3.0.
 *
 * @extends module:passport/cas/CAS~CAS
 * @ignore
 */
class CAS3 extends CAS {

  /**
   * Gets validate uri.
   *
   * It depends on cas server version.
   *
   * @return {String} The validate uri
   */
  getValidateUri() {
    return '/p3/serviceValidate';
  }

}

module.exports = CAS3;
