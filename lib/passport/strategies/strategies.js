'use strict';

/**
 * @module passport/STRATEGIES
 */

/**
 * Defines the list of available passport strategies.
 *
 * @namespace
 */
var STRATEGIES = {

  /**
   * Passport strategy to authenticate user using a CAS server.
   *
   * @const
   * @type {String}
   * @default
   * @inner
   */
  CAS: 'cas',

  /**
   * Passport strategy to authenticate user using an LDAP server.
   *
   * @const
   * @type {String}
   * @default
   * @inner
   */
  LDAP: 'ldapauth',

  /**
   * Passport strategy to authenticate user using a local server.
   *
   * @const
   * @type {String}
   * @default
   * @inner
   */
  LOCAL: 'local'

};

Object.freeze(STRATEGIES);
module.exports = STRATEGIES;
