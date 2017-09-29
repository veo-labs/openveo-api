'use strict';

/**
 * @module passport
 */

/* eslint no-sync: 0 */
const fs = require('fs');
const path = require('path');
const url = require('url');
const xml2js = require('xml2js');
const http = require('http');
const https = require('https');

class CAS {

  /**
   * Defines a cas client.
   *
   * A cas client is responsible of the protocol to communicate with the cas server.
   *
   * @example
   *     e.g. Configuration example
   *     // {
   *     //   "url": "https://openveo-cas.com:8443/cas", // CAS server url
   *     //   "version": "4", // CAS version (could be 1, 2, 3, 4)
   *     //   "certificate": "/home/test/cas.crt" // CAS certificate public key
   *     // }
   *
   * @class CAS
   * @constructor
   * @param {Object} options The list of cas strategy options
   */
  constructor(options) {
    if (!options.url)
      throw new Error('Missing cas server url for cas client');

    const urlChunks = url.parse(options.url);

    Object.defineProperties(this, {

      /**
       * CAS server url.
       *
       * @property url
       * @type String
       * @final
       */
      url: {
        value: options.url
      },

      /**
       * Cas server certificate's public key.
       *
       * @property certificate
       * @type String
       * @final
       */
      certificate: {
        value: options.certificate
      },

      /**
       * CAS server host.
       *
       * @property host
       * @type String
       * @final
       */
      host: {
        value: urlChunks.hostname
      },

      /**
       * CAS server protocol, either http or https.
       *
       * @property protocol
       * @type String
       * @final
       */
      protocol: {
        value: urlChunks.protocol === 'http:' ? 'http' : 'https'
      },

      /**
       * Either the http or https client of NodeJS.
       *
       * @property httpClient
       * @type Object
       * @final
       */
      httpClient: {
        value: urlChunks.protocol === 'http:' ? http : https
      },

      /**
       * CAS server port.
       *
       * @property port
       * @type Number
       * @final
       */
      port: {
        value: urlChunks.port || (this.protocol === 'http' ? 80 : 443)
      },

      /**
       * CAS server uri (usally /cas).
       *
       * @property path
       * @type String
       * @final
       */
      path: {
        value: urlChunks.path === '/' ? '' : urlChunks.path
      },

      /**
       * CAS server login uri.
       *
       * @property loginUri
       * @type String
       * @final
       */
      loginUri: {
        value: this.getLoginUri()
      },

      /**
       * CAS server validate uri.
       *
       * @property validateUri
       * @type String
       * @final
       */
      validateUri: {
        value: this.getValidateUri()
      }

    });

  }

  /**
   * Gets validate uri.
   *
   * @method getValidateUri
   * @return {String} The validate uri
   */
  getValidateUri() {
    return '/serviceValidate';
  }

  /**
   * Gets login uri.
   *
   * @method getLoginUri
   * @return {String} The login uri
   */
  getLoginUri() {
    return '/login';
  }

  /**
   * Gets logout uri.
   *
   * @method getLogoutUri
   * @return {String} The logout uri
   */
  getLogoutUri() {
    return '/logout';
  }

  /**
   * Gets cas server url.
   *
   * @method getUrl
   * @return {String} Cas server url
   */
  getUrl() {
    return this.url;
  }

  /**
   * Validates a ticket using cas.
   *
   * @async
   * @method validateTicket
   * @param {String} service Cas registered service
   * @param {String} ticket Ticket to validate
   * @return {Promise} Promise resolving with cas user information (name and attributes)
   */
  validateTicket(service, ticket) {
    const self = this;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.host,
        port: this.port,
        path: `${this.path}${this.validateUri}?service=${service}&ticket=${ticket}`,
        method: 'GET',
        ca: this.certificate && fs.readFileSync(path.normalize(this.certificate))
      };

      options.agent = new this.httpClient.Agent(options);

      const request = this.httpClient.request(options, (response) => {
        response.setEncoding('utf8');

        let body = '';
        response.on('data', (chunk) => {
          return body += chunk;
        });

        response.on('end', () => {
          self.analyzeValidateTicketResponse(body).then((result) => {
            resolve(result);
          }).catch((error) => {
            reject(error);
          });
        });

        response.on('error', (error) => reject(error));

      });

      request.on('error', (error) => reject(error));
      request.setTimeout(10000, () => {
        request.abort();
        reject('CAS server unavaible');
      });

      request.end();
    });
  }

  /**
   * Analyzes the validate ticket response from cas server.
   *
   * @param {String} response Validate ticket response from cas server
   * @return {Promise} Promise resolving with cas user information (name and attributes)
   */
  analyzeValidateTicketResponse(response) {
    return new Promise((resolve, reject) => {

      // Parse XML data from CAS server
      xml2js.parseString(response, {
        trim: true,
        mergeAttrs: true,
        normalize: true,
        explicitArray: false,
        tagNameProcessors: [xml2js.processors.firstCharLowerCase, xml2js.processors.stripPrefix]
      }, (error, results) => {
        if (error)
          return reject(error);

        if (!results)
          return reject(new Error('No response from cas server'));

        try {
          const failure = results.serviceResponse.authenticationFailure;
          const success = results.serviceResponse.authenticationSuccess;

          if (failure)
            return reject(new Error(failure.code));
          else if (success)
            return resolve({
              name: success.user,
              attributes: success.attributes
            });

          return reject(new Error('Unknown error'));
        } catch (e) {
          return reject(e);
        }
      });

    });
  }

}

module.exports = CAS;
