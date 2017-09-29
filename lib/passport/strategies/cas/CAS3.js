'use strict';

/**
 * @module passport
 */

const CAS = require('./CAS.js');

/**
 * Defines a cas client interfacing with cas protocol 3.0.
 *
 * @class CAS3
 * @extends CAS
 * @constructor
 */
class CAS3 extends CAS {

  /**
   * Gets validate uri.
   *
   * It depends on cas server version.
   *
   * @method getValidateUri
   * @return {String} The validate uri
   */
  getValidateUri() {
    return '/p3/serviceValidate';
  }

}

module.exports = CAS3;
