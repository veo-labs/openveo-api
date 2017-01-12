'use strict';

/**
 * @module grunt
 */

var fs = require('fs');
var async = require('async');
var fsApi = process.requireApi('lib/fileSystem.js');

/**
 * Defines a grunt task to remove a file or a directory.
 *
 *     // Register task
 *     var openVeoApi = require('@openveo/api');
 *     grunt.registerMultiTask('remove', openVeoApi.grunt.removeTask(grunt));
 *
 *     // Configure task
 *     grunt.initConfig({
 *       removeTask: {
 *         removeDirectory: {
 *           src: 'directoryToRemove'
 *         },
 *         removeFile: {
 *           src: 'fileToRemove.txt'
 *         }
 *       }
 *     });
 *
 * @class removeTask
 * @static
 */
module.exports = function(grunt) {
  return function() {
    var done = this.async();
    var asyncFunctions = [];

    // Iterate through src-dest pairs
    this.files.forEach(function(srcDestFile) {

      // Iterate through src-dest sources
      srcDestFile.src.forEach(function(src) {
        asyncFunctions.push(function(callback) {
          var removeFunction = grunt.file.isDir(src) ? fsApi.rmdir : fs.unlink;
          removeFunction(src, function(error) {
            grunt.verbose.writeln(src + ' removed');
            callback(error);
          });
        });
      });

    });

    async.series(asyncFunctions, function(error) {
      if (error)
        grunt.fail.fatal(error);

      done();
    });
  };
};
