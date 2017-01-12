'use strict';

/**
 * @module grunt
 */

var fs = require('fs');
var async = require('async');
var fsApi = process.requireApi('lib/fileSystem.js');

/**
 * Defines a grunt task to rename a file or a directory.
 *
 *     // Register task
 *     var openVeoApi = require('@openveo/api');
 *     grunt.registerMultiTask('rename', openVeoApi.grunt.renameTask(grunt));
 *
 *     // Configure task
 *     grunt.initConfig({
 *       rename: {
 *         renameDirectory: {
 *           src: 'directoryToRename',
 *           dest: 'some/sub/directories/directoryRenamed'
 *         },
 *         renameFile: {
 *           src: 'fileToRename.txt',
 *           dest: 'some/sub/directories/fileRenamed.txt'
 *         }
 *       }
 *     });
 *
 * @class renameTask
 * @static
 */
module.exports = function(grunt) {
  return function() {
    var done = this.async();
    var asyncFunctions = [];

    var rename = function(src, dest, callback) {
      grunt.verbose.writeln('Copy ' + src + ' to ' + dest);

      // Copy source
      fsApi.copy(src, dest, function(error) {
        if (error)
          return callback(error);

        grunt.verbose.writeln('Copy succeeded');
        grunt.verbose.writeln('Remove ' + src);

        // Remove original source
        var removeFunction = grunt.file.isDir(src) ? fsApi.rmdir : fs.unlink;
        removeFunction(src, function(error) {
          if (error)
            return callback(error);

          grunt.verbose.writeln('Remove succeeded');
          grunt.log.oklns(src + ' renamed into ' + dest);

          callback();
        });

      });
    };

    // Iterates through src-dest pairs
    this.files.forEach(function(srcDestFile) {
      if (srcDestFile.src.length > 1)
        grunt.fail.fatal(new Error('Only one source can be renamed into ' + srcDestFile.dest));

      asyncFunctions.push(function(callback) {
        rename(srcDestFile.src[0], srcDestFile.dest, callback);
      });
    });

    async.series(asyncFunctions, function(error) {
      if (error)
        grunt.fail.fatal(error);

      done();
    });
  };
};
