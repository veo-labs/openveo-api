'use strict';

/**
 * Defines a passport cas strategy.
 *
 * @module passport
 */

const url = require('url');
const Strategy = require('passport-strategy');

class CasStrategy extends Strategy {

  /**
   * Defines a passport cas strategy to authenticate requests using a cas server.
   *
   * @example
   *     e.g. Configuration example
   *     // {
   *     //   "service": "https://my-application-service-host", // Application service
   *     //   "url": "https://my-cas-server-host:8443/cas", // CAS server url
   *     //   "version": "3", // CAS protocol version (could be 1, 2, 3)
   *     //   "certificate": "/home/test/cas.crt" // CAS full chain certificate
   *     // }
   *
   * @class CasStrategy
   * @constructor
   * @extends Strategy
   * @param {Object} options The list of cas strategy options
   * @param {String} options.service The service to use to authenticate to the CAS server
   * @param {String} options.version The version of the CAS server
   * @param {String} options.url The url of the CAS server
   * @param {String} options.certificate The absolute path to the CAS server certificate
   * @param {Function} verify Function to call to validate user as returnd by CAS
   */
  constructor(options, verify) {
    super();

    if (!options)
      throw new Error('Missing passport cas strategy options');

    if (!options.service)
      throw new Error('Missing cas service for cas strategy');

    const version = options.version ? options.version : '3';
    let cas = null;

    try {
      const CAS = require(`./CAS${version}.js`);
      cas = new CAS(options);
    } catch (error) {
      throw new Error(`This version of cas is not implemented : ${error.message}`);
    }

    Object.defineProperties(this, {

      /**
       * Passport cas strategy name.
       *
       * @property cas
       * @type String
       * @default "cas"
       * @final
       */
      name: {
        value: 'cas'
      },

      /**
       * Application service registered in CAS.
       *
       * @property service
       * @type String
       * @final
       */
      service: {
        value: options.service
      },

      /**
       * CAS protocol version.
       *
       * @property version
       * @type String
       * @final
       */
      version: {
        value: version
      },

      /**
       * CAS client implementation.
       *
       * @property cas
       * @type CAS
       * @final
       */
      cas: {
        value: cas
      },

      /**
       * Passport verify function to call to validate user returned by CAS.
       *
       * @property verify
       * @type Function
       * @final
       */
      verify: {
        value: verify
      },

      /**
       * URI to return to after logging out.
       *
       * @property logoutUri
       * @type Function
       * @final
       */
      logoutUri: {
        value: options.logoutUri
      }

    });

  }

  /**
   * Authenticates a request using cas.
   *
   * @method authenticate
   * @async
   * @param {Object} request The express authenticate request
   * @param {Object} options Passport authenticate options such as redirects
   */
  authenticate(request, options) {
    if (!request._passport) return this.error(new Error('passport.initialize() middleware not in use'));

    const self = this;
    const requestUrl = new url.URL(request.originalUrl || request.url, this.service);
    const serviceUrl = new url.URL(requestUrl.pathname, this.service);

    if (request.query && request.query.ticket) {

      // Got a ticket to validate

      // Interrogate cas to validate the ticket
      this.cas.validateTicket(url.format(serviceUrl), request.query.ticket).then((user) => {

        // Offer the possibility to verify the user returned by CAS server
        // before considering him authenticated
        if (self.verify) {
          return self.verify(user, (error, verifiedUser, info) => {
            if (error) return self.error(error);
            if (!verifiedUser) return self.fail(info);
            return self.success(verifiedUser, info);
          });
        } else
          return self.success(user);
      }).catch((error) => {
        const message = `Authentication failed with message : "${error.message}"`;
        process.logger.error(message);
        return self.fail(message);
      });

    } else {

      // No ticket, redirect to cas server login page

      // Build login url with service registered in cas server
      const casUrl = new url.URL(this.cas.getUrl());
      const loginUrl = new url.URL(`${casUrl.pathname}${this.cas.getLoginUri()}`, this.cas.getUrl());
      loginUrl.searchParams.append('service', url.format(serviceUrl));

      // Redirect to cas login page
      this.redirect(url.format(loginUrl), 307);
    }
  }

  /**
   * Logouts from cas.
   *
   * @method logout
   * @param {Object} request The express logout request
   * @param {Object} request The express response
   */
  logout(request, response) {
    const serviceUrl = new url.URL(this.service);
    serviceUrl.pathname = '/';

    // Build login url with service registered in cas server
    const casUrl = new url.URL(this.cas.getUrl());
    const redirectUrl = new url.URL(this.logoutUri, serviceUrl);
    const logoutUrl = new url.URL(`${casUrl.pathname}${this.cas.getLogoutUri()}`, casUrl);
    logoutUrl.searchParams.append('service', url.format(serviceUrl));
    logoutUrl.searchParams.append('url', url.format(redirectUrl));

    // Logout from cas by redirecting to cas logout url
    response.statusCode = 307;
    response.setHeader('Location', url.format(logoutUrl));
    response.setHeader('Content-Length', '0');
    response.end();
  }

}

module.exports = CasStrategy;
