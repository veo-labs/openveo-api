'use strict';

/**
 * Provides functions to interact with the file system as an extension to the Node.js filesystem module.
 *
 * @module fileSystem
 * @class fileSystem
 * @main fileSystem
 */

// Module dependencies
var fs = require('fs');
var path = require('path');
var tar = require('tar');

/**
 * Creates a directory recursively and asynchronously.
 *
 * If parent directories do not exist, they will be automatically created.
 *
 * @method mkdirRecursive
 * @private
 * @async
 * @param {String} directoryPath The directory system path to create
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
function mkdirRecursive(directoryPath, callback) {
  directoryPath = path.resolve(directoryPath);

  // Try to create directory
  fs.mkdir(directoryPath, function(error) {

    if (error && error.code === 'EEXIST') {

      // Can't create directory it already exists
      // It may have been created by another loop
      callback();

    } else if (error && error.code === 'ENOENT') {

      // Can't create directory, parent directory does not exist

      // Create parent directory
      mkdirRecursive(path.dirname(directoryPath), function(error) {
        if (!error) {

          // Now that parent directory is created, create requested directory
          fs.mkdir(directoryPath, function(error) {
            if (error && error.code === 'EEXIST') {

              // Can't create directory it already exists
              // It may have been created by another loop
              callback();

            } else
              callback(error);
          });

        } else
          callback(error);
      });
    } else
      callback(error);
  });
}

/**
 * Removes a directory and all its content recursively and asynchronously.
 *
 * It is assumed that the directory exists.
 *
 * @method rmdirRecursive
 * @private
 * @async
 * @param {String} directoryPath Path of the directory to remove
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
function rmdirRecursive(directoryPath, callback) {

  // Open directory
  fs.readdir(directoryPath, function(error, resources) {

    // Failed reading directory
    if (error)
      return callback(error);

    var pendingResourceNumber = resources.length;

    // No more pending resources, done for this directory
    if (!pendingResourceNumber) {

      // Remove directory
      fs.rmdir(directoryPath, callback);

    }

    // Iterate through the list of resources in the directory
    resources.forEach(function(resource) {

      var resourcePath = path.join(directoryPath, resource);

      // Get resource stats
      fs.stat(resourcePath, function(error, stats) {
        if (error)
          return callback(error);

        // Resource correspond to a directory
        if (stats.isDirectory()) {

          resources = rmdirRecursive(path.join(directoryPath, resource), function(error) {
            if (error)
              return callback(error);

            pendingResourceNumber--;

            if (!pendingResourceNumber)
              fs.rmdir(directoryPath, callback);

          });

        } else {

          // Resource does not correspond to a directory
          // Mark resource as treated

          // Remove file
          fs.unlink(resourcePath, function(error) {
            if (error)
              return callback(error);
            else {
              pendingResourceNumber--;

              if (!pendingResourceNumber)
                fs.rmdir(directoryPath, callback);

            }
          });

        }

      });

    });

  });

}

/**
 * Copies a file.
 *
 * If directory does not exist it will be automatically created.
 *
 * @method copyFile
 * @private
 * @async
 * @param {String} sourceFilePath Path of the file
 * @param {String} destinationFilePath Final path of the file
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
function copyFile(sourceFilePath, destinationFilePath, callback) {
  var onError = function(error) {
    callback(error);
  };

  var safecopy = function(sourceFilePath, destinationFilePath, callback) {
    if (sourceFilePath && destinationFilePath && callback) {
      try {
        var is = fs.createReadStream(sourceFilePath);
        var os = fs.createWriteStream(destinationFilePath);

        is.on('error', onError);
        os.on('error', onError);

        is.on('end', function() {
          os.end();
          callback();
        });

        is.pipe(os);
      } catch (e) {
        callback(new Error(e.message));
      }
    } else callback(new Error('File path not defined'));
  };

  var pathDir = path.dirname(destinationFilePath);

  this.mkdir(pathDir,
    function(error) {
      if (error) callback(error);
      else safecopy(sourceFilePath, destinationFilePath, callback);
    }
  );
}

/**
 * Extracts a tar file to the given directory.
 *
 * @method extract
 * @async
 * @param {String} filePath Path of the file to extract
 * @param {String} destinationPath Path of the directory where to
 * extract files
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
module.exports.extract = function(filePath, destinationPath, callback) {
  var extractTimeout;
  var onError = function(error) {
    if (extractTimeout)
      clearTimeout(extractTimeout);

    callback(error);
  };

  if (filePath && destinationPath && callback) {

    // Prepare the extractor with destination path
    var extractor = tar.Extract(
      {
        path: path.normalize(destinationPath)
      }
    );

    // Handle extraction end
    extractor.on('end', function() {
      if (extractTimeout)
        clearTimeout(extractTimeout);

      callback();
    });

    var tarFileReadableStream = fs.createReadStream(path.normalize(filePath));

    // Handle errors
    tarFileReadableStream.on('error', onError);
    extractor.on('error', onError);

    // Listen to readable stream close event
    tarFileReadableStream.on('close', function(chunk) {

      // In case of a broken archive, the readable stream close event is dispatched but not the close event of the
      // writable stream, wait for 10 seconds and dispatch an error if writable stream is still not closed
      extractTimeout = setTimeout(onError, 10000, new Error('Unexpected end of archive'));

    });

    // Extract file
    tarFileReadableStream.pipe(extractor);

  }
};

/**
 * Copies a file or a directory.
 *
 * @method copy
 * @async
 * @param {String} sourcePath Path of the source to copy
 * @param {String} destinationSourcePath Final path of the source
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
module.exports.copy = function(sourcePath, destinationSourcePath, callback) {
  var self = this;

  // Get source stats to test if this is a directory or a file
  fs.stat(sourcePath, function(error, stats) {
    if (error)
      return callback(error);

    if (stats.isDirectory()) {

      // Resource is a directory

      // Open directory
      fs.readdir(sourcePath, function(error, resources) {

        // Failed reading directory
        if (error)
          return callback(error);

        var pendingResourceNumber = resources.length;

        // Iterate through the list of resources in the directory
        resources.forEach(function(resource) {
          var resourcePath = path.join(sourcePath, resource);
          var resourceDestinationPath = path.join(destinationSourcePath, resource);

          // Copy resource
          self.copy(resourcePath, resourceDestinationPath, function(error) {
            if (error)
              return callback(error);

            pendingResourceNumber--;

            if (!pendingResourceNumber)
              callback();
          });
        });

      });

    } else {

      // Resource is a file
      copyFile.call(self, sourcePath, destinationSourcePath, callback);

    }

  });

};

/**
 * Gets a JSON file content.
 *
 * This will verify that the file exists first.
 *
 * @method getJSONFileContent
 * @async
 * @param {String} filePath The path of the file to read
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **String** The file content or null if an error occurred
 */
module.exports.getJSONFileContent = function(filePath, callback) {

  // Check if file exists
  fs.exists(filePath, function(exists) {

    if (exists) {

      // Read file content
      fs.readFile(filePath, {
        encoding: 'utf8'
      },
      function(error, data) {
        if (error) {
          callback(error);
        } else {
          try {

            // Try to parse file data as JSON content
            var dataAsJson = JSON.parse(data);
            callback(null, dataAsJson);

          } catch (e) {
            callback(new Error(e.message));
          }
        }
      });
    }
    else
      callback(new Error('Missing file ' + filePath));

  });

};

/**
 * Creates a directory.
 *
 * If parent directory does not exist, it will be automatically created.
 * If directory already exists, it won't do anything.
 *
 * @method mkdir
 * @async
 * @param {String} directoryPath The directory system path to create
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
module.exports.mkdir = function(directoryPath, callback) {
  fs.exists(directoryPath, function(exists) {
    if (exists)
      callback();
    else
      mkdirRecursive(directoryPath, callback);
  });
};

/**
 * Removes a directory and all its content recursively and asynchronously.
 *
 * @method rmdir
 * @async
 * @param {String} directoryPath Path of the directory to remove
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
module.exports.rmdir = function(directoryPath, callback) {
  fs.exists(directoryPath, function(exists) {
    if (!exists)
      callback();
    else
      rmdirRecursive(directoryPath, callback);
  });
};

/**
 * Gets OpenVeo configuration directory path.
 *
 * OpenVeo configuration is stored in user home directory.
 *
 * @method getConfDir
 * @return {String} OpenVeo configuration directory path
 */
module.exports.getConfDir = function() {
  var env = process.env;
  var home = env.HOME;

  if (process.platform === 'win32')
    home = env.USERPROFILE || env.HOMEDRIVE + env.HOMEPATH || home || '';

  return path.join(home, '.openveo');
};
