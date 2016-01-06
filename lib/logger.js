'use strict';

/**
 * Provides functions to manage loggers.
 *
 * @module logger
 * @class logger
 * @main logger
 */

var winston = require('winston');

/**
 * Adds a new logger.
 *
 * Added loggers will also log to process standard output in development mode (not in production).
 *
 * @example
 *     var loggerAPI = require('@openveo/api').logger;
 *
 *     var conf =  {
 *      'fileName' : '/tmp/openveo/logs/openveo.log',
 *      'level' : 'debug',
 *      'maxFileSize' : 1048576,
 *      'maxFiles' : 2
 *     };
 *
 *     // Initializes logger "openveo"
 *     loggerAPI.add('openveo', conf);
 *     var logger = loggerAPI.get('openveo');
 *
 *     // Log something
 *     logger.info('A simple log');
 *
 * @method add
 * @param {String} name The name of the logger
 * @param {Object} [conf] Logger configuration to initialize a new logger
 * Available debug levels are :
 *  - silly
 *  - debug
 *  - verbose
 *  - info
 *  - warn
 *  - error
 */
module.exports.add = function(name, conf) {
  if (!winston.loggers.loggers[name] && conf) {

    // Create logger
    winston.loggers.add(name, {
      file: {
        level: conf.level,
        filename: conf.fileName,
        maxsize: conf.maxFileSize,
        maxFiles: conf.maxFiles
      }
    });

    // Remove default logger, which log to the standard output, in production environment
    if (process.env.NODE_ENV == 'production')
      winston.loggers.get(name).remove(winston.transports.Console);

  }

  return winston.loggers.get(name);
};

/**
 * Gets a logger.
 *
 * @example
 *     var loggerAPI = require('@openveo/api').logger;
 *
 *     // Get openveo logger
 *     var logger = loggerAPI.get('openveo');
 *
 *     // Log something
 *     logger.info('A simple log');
 *
 * @method get
 * @param {String} name The name of the logger
 * @return {Object} A winston logger
 */
module.exports.get = function(name) {
  return winston.loggers.get(name);
};
