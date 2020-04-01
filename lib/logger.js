'use strict';

/**
 * Defines functions to manage loggers.
 *
 *     // Load module "logger"
 *     var loggerAPI = require('@openveo/api').logger;
 *
 * @module logger
 * @main logger
 * @class logger
 * @static
 */

var winston = require('winston');

/**
 * Adds a new file logger.
 *
 * @example
 *     var loggerAPI = require('@openveo/api').logger;
 *
 *     var conf =  {
 *      'fileName' : '/tmp/openveo/logs/openveo.log', // File to log to
 *      'level' : 'debug', // Debug level
 *      'maxFileSize' : 1048576, // Maximum file size (in bytes)
 *      'maxFiles' : 2, // Maximum number of archived files
 *      'console': false // Deactivate logs in standard output
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
 * @static
 * @param {String} name The name of the logger
 * @param {Object} [conf] Logger configuration to initialize a new logger, if not specified a default
 * logger will be created without any transport streams
 * @param {String} conf.fileName The absolute path to the log file
 * @param {String} [conf.level] The log level (either silly, debug, verbose, info, warn or error)
 * @param {Number} [conf.maxFileSize] The maximum file size before log rotation
 * @param {Number} [conf.maxFiles] The maximum number of files for log rotation
 * @param {Boolean} [conf.console=false] true to activate logs to standard output
 */
module.exports.add = function(name, conf) {
  var consoleTransport = new winston.transports.Console({
    level: (conf && conf.level) || 'warn',
    silent: (process.env.NODE_ENV == 'production' || !conf || !conf.console),
    format: winston.format.combine(
      winston.format.json()
    )
  });

  if (!this.get(name)) {
    if (conf && conf.fileName) {
      winston.loggers.add(name, {
        transports: [
          new winston.transports.File({
            level: conf.level,
            filename: conf.fileName,
            maxsize: conf.maxFileSize,
            maxFiles: conf.maxFiles
          }),
          consoleTransport
        ]
      });
    } else {
      winston.loggers.add(name, {
        transports: [consoleTransport]
      });
    }
  }

  return this.get(name);
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
 * @static
 * @param {String} name The name of the logger
 * @return {Object|Undefined} A winston logger or undefined if no logger corresponds to the given name
 */
module.exports.get = function(name) {
  return winston.loggers.loggers.get(name);
};
