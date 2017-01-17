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
 * Added loggers will also log to process standard output in development mode (not in production).
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
 * @param {Object} [conf] Logger configuration to initialize a new logger
 * @param {String} conf.fileName The absolute path to the log file
 * @param {String} [conf.level] The log level (either silly, debug, verbose, info, warn or error)
 * @param {Number} [conf.maxFileSize] The maximum file size before log rotation
 * @param {Number} [conf.maxFiles] The maximum number of files for log rotation
 * @param {Boolean} [conf.console=true] false to deactivate logs in standard output
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
    if (process.env.NODE_ENV == 'production' || conf.console === false)
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
 * @static
 * @param {String} name The name of the logger
 * @return {Object} A winston logger
 */
module.exports.get = function(name) {
  return winston.loggers.get(name);
};
