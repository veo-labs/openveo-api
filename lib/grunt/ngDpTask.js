'use strict';

/**
 * @module grunt/ngDpTask
 */

var fs = require('fs');

var async = require('async');

var parser = process.requireApi('lib/angularJs/parser.js');

/**
 * Defines a grunt task to build the list of sources (css and js) of an AngularJS application.
 *
 * @example
 * // Register task
 * var openVeoApi = require('@openveo/api');
 * grunt.registerMultiTask('ngDp', openVeoApi.grunt.ngDpTask(grunt));
 *
 * // Configure task
 * grunt.initConfig({
 *   'ngDp': {
 *     options: {
 *       basePath: '/path/to/the/',
 *       cssPrefix: '../../other/css/path/',
 *       jsPrefix: '../../other/js/path/'
 *     },
 *     app1: {
 *       src: '/path/to/the/app1/**\/*.*',
 *       dest: '/path/to/the/app1/topology.json'
 *     },
 *     app2: {
 *       src: '/path/to/the/app2**\/*.*',
 *       dest: '/path/to/the/app2/topology.json'
 *     }
 *   }
 * });
 *
 * // Ouput example (/path/to/the/app1/topology.json)
 * {
 *   js: ['../..other/js/path/app1/file1.js', '../..other/js/path/app1/file2.js', [...]],
 *   css: ['../..other/css/path/app1/file1.css', '../..other/css/path/app1/file2.css', [...]]
 * }
 *
 * AngularJS applications, which respect components architecture, need to be loaded in the right order as some
 * components may depend on other components. This task helps build an array of JavaScript files and css / scss files
 * in the right order.
 *
 * For this to work, each module must be declared in a separated file and a single file should not define AngularJS
 * elements belonging to several different modules.
 *
 * Available options are:
 *   - basePath: The base path which will be replaced by the cssPrefix or jsPrefix
 *   - cssPrefix: For CSS / SCSS files, replace the basePath by this prefix
 *   - jsPrefix: For JS files, replace the basePath by this prefix
 *
 * @method
 * @static
 * @param {Object} grunt Grunt instance
 * @return {Function} Task function
 */
module.exports = function(grunt) {
  return function() {
    var done = this.async();
    var asyncFunctions = [];
    var options = this.options({
      basePath: '',
      cssPrefix: '',
      jsPrefix: ''
    });

    /**
     * Generates a file with the list of JS and CSS files in the right order.
     *
     * @param {Array} sourceFiles The list of grunt source files
     * @param {String} destination The destination file which will contain the list of JS files and CSS files
     * @param {callback} callback The function to call when it's done
     */
    var generateSourcesFile = function(sourceFiles, destination, callback) {
      var readAsyncFunctions = [];
      var sources = [];

      sourceFiles.forEach(function(sourceFile) {
        readAsyncFunctions.push(function(callback) {
          grunt.verbose.writeln('read file ' + sourceFile);

          fs.stat(sourceFile, function(error, fileStat) {
            if (fileStat && fileStat.isFile()) {
              sources.push(sourceFile);
            }
            callback(error);
          });
        });
      });

      // Get all source files paths
      async.parallel(readAsyncFunctions, function(error) {
        if (error) return callback(error);

        parser.orderSources(sources, function(orderSourcesError, orderedSources) {
          if (orderSourcesError) return callback(orderSourcesError);

          orderedSources.js = orderedSources.js.map(function(jsSourceFilePath) {
            return jsSourceFilePath.replace(options.basePath, options.jsPrefix);
          });

          orderedSources.css = orderedSources.css.map(function(cssSourceFilePath) {
            return cssSourceFilePath.replace(options.basePath, options.cssPrefix);
          });

          // Create final file
          grunt.file.write(destination, JSON.stringify(orderedSources));

          callback();
        });

      });
    };

    // Iterates through src-dest pairs
    this.files.forEach(function(srcDestFile) {
      asyncFunctions.push(function(callback) {
        generateSourcesFile(srcDestFile.src, srcDestFile.dest, callback);
      });
    });

    async.series(asyncFunctions, function(error) {
      if (error)
        grunt.fail.fatal(error);

      done();
    });
  };
};
