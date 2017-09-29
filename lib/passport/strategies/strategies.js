'use strict';

/**
 * @module passport
 */

/**
 * Defines the list of available passport strategies.
 *
 * @class STRATEGIES
 * @static
 */

var STRATEGIES = {

  /**
   * Passport strategy to authenticate user using a CAS server.
   *
   * @property CAS
   * @type String
   * @default 'cas'
   * @final
   */
  CAS: 'cas',

  /**
   * Passport strategy to authenticate user using an LDAP server.
   *
   * @property LDAP
   * @type String
   * @default 'ldapauth'
   * @final
   */
  LDAP: 'ldapauth',

  /**
   * Passport strategy to authenticate user using a local server.
   *
   * @property LOCAL
   * @type String
   * @default 'local'
   * @final
   */
  LOCAL: 'local'

};

Object.freeze(STRATEGIES);
module.exports = STRATEGIES;
