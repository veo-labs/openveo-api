'use strict';

/**
 * Gets an instance of a passport strategy.
 *
 * Have a look at require('@openveo/api').passport.STRATEGIES to find out which
 * passport strategies are supported.
 *
 * @module passport
 * @main passport
 */

/* eslint no-sync: 0 */
var fs = require('fs');
var STRATEGIES = process.requireApi('lib/passport/strategies/strategies.js');

/**
 * Gets an instance of a passport strategy.
 *
 * @example
 *     e.g. cas strategy configuration example
 *     // {
 *
 *     //   // Application service
 *     //   "service": "https://my-application-service-host",
 *
 *     //   // CAS server url
 *     //   "url": "https://my-cas-server-host:8443/cas",
 *
 *     //   // CAS protocol version (could be 1, 2, 3)
 *     //   "version": "3",
 *
 *     //   // CAS full chain certificate if one of the CAs not in system well known CAs
 *     //   "certificate": "/home/test/cas.crt"
 *
 *     //   // URI to return to when logged out
 *     //   "logoutUri": "be"
 *
 *     // }
 *
 *     e.g. ldapauth strategy configuration example
 *     // {
 *
 *     //   // The url of the LDAP server
 *     //   "url": "ldaps://my-ldap-server-host",
 *
 *     //   // The LDAP attribute used by "bindDn" (default to "dn")
 *     //   "bindAttribute": "dn",
 *
 *     //   // The value of the "bindAttribute" associated to the entry used to connect to the server
 *     //   "bindDn": "cn=my-user,dc=my-ldap,dc=test",
 *
 *     //   // The password of the entry used to connect to the server
 *     //   "bindPassword": "qT5gvobG2ZxYSiY2r4mt",
 *
 *     //   // The search base when looking for users
 *     //   "searchBase": "ou=user,dc=my-ldap,dc=test",
 *
 *     //   // The search scope when looking for users (default to "sub")
 *     //   "searchScope": "sub",
 *
 *     //   // The search filter to find user by name, use placeholder "{{username}}" which will be replaced
 *     //   // by the user name when searching
 *     //   "searchFilter": "(&(objectclass=person)(cn={{username}}))",
 *
 *     //   // The name of the LDAP attribute holding the group name of a user
 *     //   "userGroupAttribute": "group",
 *
 *     //   // The name of the LDAP attribute holding the name of a user
 *     //   "userNameAttribute": "cn",
 *
 *     //   // The name of the LDAP attribute holding the id of a user
 *     //   "userIdAttribute": "dn",
 *
 *     //   // The name of the LDAP attribute holding the email of a user
 *     //   "userEmailAttribute": "email",
 *
 *     //   // The absolute path of the LDAP server certificate full chain if root CA is not
 *     //   // in the Node.JS well known CAs
 *     //   "certificate": "/absolute/path/to/cert/ldap.crt",
 *
 *     //   // The name of the field in the authenticate request which will hold the user name
 *     //   "usernameField": "login",
 *
 *     //   // The name of the field in the authenticate request which will hold the user name
 *     //   "passwordField": "password"
 *
 *     //   // Use STARTTLS LDAPv3 option instead of LDAPS
 *     //   "starttls": true
 *
 *     // }
 *
 *     e.g. local strategy configuration example
 *     // {
 *
 *     //   // The name of the field in the authenticate request which will hold the user name
 *     //   "usernameField": "login",
 *
 *     //   // The name of the field in the authenticate request which will hold the user password
 *     //   "passwordField": "password"
 *
 *     // }
 *
 * @method get
 * @static
 * @param {String} id The id of the strategy, see require('@openveo/api').passport.STRATEGIES
 * to find out which strategies are supported
 * @param {Object} configuration Strategy configuration, it depends on the strategy
 * @param {Function} verify Passport verify callback to validate the user authenticated by the third party provider
 *   - **Object** The user authenticated by the third party provider
 *   - **Function** Function to call when verification has been performed
 *     - **Error** An error occured during verification
 *     - **Object** The verified user
 *     - **String** Informative message about verification failure
 * @return {Object} A passport strategy
 */
module.exports.get = function(id, configuration, verify) {
  if (id && configuration) {
    var Strategy;
    var strategy;

    switch (id) {

      // CAS strategy
      case STRATEGIES.CAS:
        Strategy = require('./cas/CasStrategy.js');
        strategy = new Strategy({
          service: configuration.service,
          url: configuration.url,
          version: configuration.version,
          certificate: configuration.certificate,
          logoutUri: configuration.logoutUri
        }, verify);

        strategy.internal = false;
        break;

      // LDAP strategy
      case STRATEGIES.LDAP: {
        Strategy = require('passport-ldapauth');
        var attributes = [];
        if (configuration.userIdAttribute) attributes.push(configuration.userIdAttribute);
        if (configuration.userNameAttribute) attributes.push(configuration.userNameAttribute);
        if (configuration.userEmailAttribute) attributes.push(configuration.userEmailAttribute);
        if (configuration.userGroupAttribute) attributes.push(configuration.userGroupAttribute);

        strategy = new Strategy({
          server: {
            url: configuration.url,
            bindDN: configuration.bindDn,
            bindCredentials: configuration.bindPassword,
            searchBase: configuration.searchBase,
            searchScope: configuration.searchScope,
            searchFilter: configuration.searchFilter,
            searchAttributes: attributes.length ? attributes : null,
            bindProperty: configuration.bindAttribute,
            tlsOptions: {
              ca: configuration.certificate ? fs.readFileSync(configuration.certificate) : null
            },
            starttls: configuration.starttls
          },
          usernameField: configuration.usernameField,
          passwordField: configuration.passwordField
        }, verify);

        strategy.internal = true;
        break;
      }

      // Local strategy
      case STRATEGIES.LOCAL:
        Strategy = require('passport-local').Strategy;
        strategy = new Strategy({
          usernameField: configuration.usernameField,
          passwordField: configuration.passwordField
        }, verify);
        strategy.internal = true;
        break;

      default:
        throw new Error('Unknown passport strategy');

    }

    return strategy;
  }

  return null;
};
