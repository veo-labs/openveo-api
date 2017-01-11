'use strict';

/**
 * Defines functions to help translate the application.
 *
 * Translations are grouped by dictionaries.
 *
 *     // Load module "i18n"
 *     var i18nApi = require('@openveo/api').i18n;
 *
 * @module i18n
 * @main i18n
 * @class i18n
 * @static
 */

var path = require('path');
var fs = require('fs');
var async = require('async');
var pluginManager = process.requireApi('lib/plugin/pluginManager.js');
var utilExt = process.requireApi('lib/util.js');

/**
 * Gets a dictionary of translations by its name and language.
 *
 * Search is made on i18n directory and all plugin's i18n directories.
 * If the same dictionary name is found twice (same file name in different i18n directories),
 * dictionaries are merged.
 *
 * @example
 *     var i18n = require('@openveo/api').i18n;
 *     i18n.getTranslations('login', 'fr-FR', function(error, translations){
 *       console.log(translations);
 *     });
 *
 * @example
 *     var i18n = require('@openveo/api').i18n;
 *     i18n.getTranslations("back-office", "en", function(error, translations){
 *       console.log(translations);
 *     });
 *
 * @method getTranslations
 * @static
 * @async
 * @param {String} dictionary The name of the dictionary, this is the name of the dictionary file without
 * extension
 * @param {String} code The language country code (e.g. en-US)
 * @param {Function} callback Function to call when its done
 *  - **Error** An error if something went wrong
 *  - **Object** A JavaScript object containing all translations
 */
module.exports.getTranslations = function(dictionary, code, callback) {
  var translations = null;

  if (!dictionary)
    return callback(null, translations);

  code = code || 'en';
  var plugins = pluginManager.getPlugins() || [];
  var countryCode = code.split('-');
  var language = countryCode[0];
  var country = countryCode[1];
  var asyncFunctions = [];

  plugins.forEach(function(plugin) {
    if (plugin.i18nDirectory) {

      // Plugin has an i18n directory
      // Read files in the directory to find the expected dictionary
      asyncFunctions.push(function(callback) {
        fs.readdir(plugin.i18nDirectory, function(error, directoryFiles) {
          if (error) {
            process.logger.error(error.message, {
              plugin: plugin.name,
              dir: plugin.i18nDirectory
            });
            callback(new Error('An error occured while reading the i18n directory'));
            return;
          }
          var translationFile;
          var pluginNameUpperCase = plugin.name.toUpperCase();

          // Iterate through directory files to find the dictionary
          for (var i = 0; i < directoryFiles.length; i++) {
            var fileName = directoryFiles[i];
            if (fileName === dictionary + '-' + language + '_' + country + '.json') {
              translationFile = fileName;
              break;
            } else if (fileName === dictionary + '-' + language + '.json')
              translationFile = fileName;
          }

          try {

            if (translationFile) {
              var pluginTranslations = require(path.join(plugin.i18nDirectory, translationFile));
              var encapsulatedPluginTranslations;
              translations = translations || {};

              // Make sure translations are contained in an object with the plugin name as the key
              if (Object.keys(pluginTranslations).length > 1 || !pluginTranslations[pluginNameUpperCase]) {
                encapsulatedPluginTranslations = {};
                encapsulatedPluginTranslations[pluginNameUpperCase] = pluginTranslations;
              } else
                encapsulatedPluginTranslations = pluginTranslations;

              utilExt.merge(translations, encapsulatedPluginTranslations);
            }

          } catch (e) {
            process.logger.error(e.message, {
              plugin: plugin.name,
              dir: plugin.i18nDirectory,
              file: translationFile
            });
            callback(new Error('An error occured while loading a translations dictionary'));
            return;
          }

          callback();
        });

      });
    }
  });

  async.parallel(asyncFunctions, function(error, results) {
    callback(error, translations);
  });
};
