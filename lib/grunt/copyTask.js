'use strict';

/**
 * @module grunt
 */

var path = require('path');
var async = require('async');
var fsApi = process.requireApi('lib/fileSystem.js');

/**
 * Defines a grunt task to copy a file or a directory.
 *
 *     // Register task
 *     var openVeoApi = require('@openveo/api');
 *     grunt.registerMultiTask('copy', openVeoApi.grunt.copyTask(grunt));
 *
 *     // Configure task
 *     grunt.initConfig({
 *       copy: {
 *         copyDirectory: {
 *           src: 'directoryToCopy',
 *           dest: 'some/directory/'
 *         },
 *         copyFile: {
 *           src: 'fileToCopy.txt',
 *           dest: 'some/directory/'
 *         }
 *       }
 *     });
 *
 * @class copyTask
 * @static
 */
module.exports = function(grunt) {
  return function() {
    var done = this.async();
    var asyncFunctions = [];

    var copy = function(src, dest, callback) {
      grunt.verbose.writeln('Copy ' + src + ' to ' + dest);

      // Copy source
      fsApi.copy(src, path.join(dest, path.basename(src)), function(error) {
        if (error) return callback(error);

        grunt.verbose.writeln('Copy succeeded');
        callback();
      });

    };

    // Iterates through src-dest pairs
    this.files.forEach(function(srcDestFile) {
      srcDestFile.src.forEach(function(file) {
        asyncFunctions.push(function(callback) {
          copy(file, srcDestFile.dest, callback);
        });
      });
    });

    async.series(asyncFunctions, function(error) {
      if (error) return grunt.fail.fatal(error);
      done();
    });
  };
};
