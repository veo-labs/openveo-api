'use strict';

/**
 * Defines functions to interact with the file system as an extension to the Node.js filesystem module.
 *
 *     // Load module "fileSystem"
 *     var fsApi = require('@openveo/api').fileSystem;
 *
 * @module fileSystem
 * @main fileSystem
 * @class fileSystem
 * @static
 */

var fs = require('fs');
var path = require('path');
var tar = require('tar-fs');

/**
 * Creates a directory recursively and asynchronously.
 *
 * If parent directories do not exist, they will be automatically created.
 *
 * @method mkdirRecursive
 * @private
 * @static
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
 * @static
 * @async
 * @param {String} directoryPath Path of the directory to remove
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
function rmdirRecursive(directoryPath, callback) {
  var terminated = false;
  var terminate = function(error) {
    if (terminated) return;
    terminated = true;
    callback(error);
  };

  // Open directory
  fs.readdir(directoryPath, function(error, resources) {

    // Failed reading directory
    if (error)
      return terminate(error);

    var pendingResourceNumber = resources.length;

    // No more pending resources, done for this directory
    if (!pendingResourceNumber) {

      // Remove directory
      fs.rmdir(directoryPath, terminate);

    }

    // Iterate through the list of resources in the directory
    resources.forEach(function(resource) {

      var resourcePath = path.join(directoryPath, resource);

      // Get resource stats
      fs.stat(resourcePath, function(error, stats) {
        if (terminated) return;
        if (error)
          return terminate(error);

        // Resource correspond to a directory
        if (stats.isDirectory()) {

          resources = rmdirRecursive(path.join(directoryPath, resource), function(error) {
            if (terminated) return;
            if (error)
              return terminate(error);

            pendingResourceNumber--;

            if (!pendingResourceNumber)
              fs.rmdir(directoryPath, terminate);

          });

        } else {

          // Resource does not correspond to a directory
          // Mark resource as treated

          // Remove file
          fs.unlink(resourcePath, function(error) {
            if (terminated) return;
            if (error)
              return terminate(error);
            else {
              pendingResourceNumber--;

              if (!pendingResourceNumber)
                fs.rmdir(directoryPath, terminate);

            }
          });

        }

      });

    });

  });

}

/**
 * Reads a directory content recursively and asynchronously.
 *
 * It is assumed that the directory exists.
 *
 * @method readdirRecursive
 * @private
 * @static
 * @async
 * @param {String} directoryPath Path of the directory
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of fs.Stats corresponding to resources inside the directory (files and directories)
 */
function readdirRecursive(directoryPath, callback) {
  var resources = [];
  var terminated = false;
  var terminate = function(error, results) {
    if (terminated) return;
    terminated = true;
    callback(error, results);
  };

  // Read directory
  fs.readdir(directoryPath, function(error, resourcesNames) {

    // Failed reading directory
    if (error) return terminate(error);

    var pendingResourceNumber = resourcesNames.length;

    // No more pending resources, done for this directory
    if (!pendingResourceNumber)
      return terminate(null, resources);

    // Iterate through the list of resources in the directory
    resourcesNames.forEach(function(resourceName) {
      var resourcePath = path.join(directoryPath, resourceName);

      // Get resource stats
      fs.stat(resourcePath, function(error, stats) {
        if (terminated) return;
        if (error)
          return terminate(error);

        stats.path = resourcePath;
        resources.push(stats);

        // Resource correspond to a directory
        if (stats.isDirectory()) {

          readdirRecursive(resourcePath, function(error, paths) {
            if (terminated) return;
            if (error)
              return terminate(error);

            resources = resources.concat(paths);
            pendingResourceNumber--;

            if (!pendingResourceNumber)
              terminate(null, resources);

          });

        } else {

          // Resource does not correspond to a directory
          // Mark resource as treated

          pendingResourceNumber--;

          if (!pendingResourceNumber)
            terminate(null, resources);
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
 * @static
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
        });

        os.on('finish', function() {
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
 * The list of file types.
 *
 * @property FILE_TYPES
 * @type Object
 * @final
 */
module.exports.FILE_TYPES = {
  JPG: 'jpg',
  PNG: 'png',
  GIF: 'gif',
  TAR: 'tar',
  MP4: 'mp4',
  BMP: 'bmp',
  UNKNOWN: 'unknown'
};

Object.freeze(this.FILE_TYPES);

/**
 * The list of file types.
 *
 * @property FILE_TYPES
 * @type Object
 * @final
 */
module.exports.FILE_SIGNATURES = {
  [this.FILE_TYPES.JPG]: [
    {
      offset: 0,
      signature: 'ffd8ffdb'
    },
    {
      offset: 0,
      signature: 'ffd8ffe0'
    },
    {
      offset: 0,
      signature: 'ffd8ffe1'
    },
    {
      offset: 0,
      signature: 'ffd8fffe'
    }
  ],
  [this.FILE_TYPES.PNG]: [{
    offset: 0,
    signature: '89504e47'
  }],
  [this.FILE_TYPES.GIF]: [{
    offset: 0,
    signature: '47494638'
  }],
  [this.FILE_TYPES.TAR]: [{
    offset: 257,
    signature: '7573746172' // ustar
  }],
  [this.FILE_TYPES.MP4]: [
    {
      offset: 4,
      signature: '6674797069736f6d' // isom
    },
    {
      offset: 4,
      signature: '6674797033677035' // 3gp5
    },
    {
      offset: 4,
      signature: '667479706d703431' // mp41
    },
    {
      offset: 4,
      signature: '667479706d703432' // mp42
    },
    {
      offset: 4,
      signature: '667479704d534e56' // MSNV
    },
    {
      offset: 4,
      signature: '667479704d345620' // M4V
    }
  ]
};

Object.freeze(this.FILE_SIGNATURES);

/**
 * Extracts a tar file to the given directory.
 *
 * @method extract
 * @static
 * @async
 * @param {String} filePath Path of the file to extract
 * @param {String} destinationPath Path of the directory where to
 * extract files
 * @param {Function} [callback] The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
module.exports.extract = function(filePath, destinationPath, callback) {
  var streamError;

  callback = callback || function(error) {
    if (error)
      process.logger.error('Extract error', {error: error, path: destinationPath});
    else
      process.logger.silly(filePath + ' extracted into ' + destinationPath);
  };

  if (filePath && destinationPath) {

    // Prepare the extractor with destination path
    var extractor = tar.extract(path.normalize(destinationPath));

    var onError = function(error) {
      streamError = error;
      extractor.end();
      callback(streamError);
    };

    // Handle extraction end
    extractor.on('finish', function() {
      process.logger.silly('extractor end', {path: destinationPath});

      if (!streamError) callback();
    });

    var tarFileReadableStream = fs.createReadStream(path.normalize(filePath));

    // Handle errors
    tarFileReadableStream.on('error', onError);
    extractor.on('error', onError);

    // Extract file
    tarFileReadableStream.pipe(extractor);

  } else
    callback(new TypeError('Invalid filePath and / or destinationPath, expected strings'));
};

/**
 * Copies a file or a directory.
 *
 * @method copy
 * @static
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

        // Directory is empty, create it and leave
        if (!pendingResourceNumber) {
          self.mkdir(destinationSourcePath, callback);
          return;
        }

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
 * @static
 * @async
 * @param {String} filePath The path of the file to read
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **String** The file content or null if an error occurred
 * @throws {TypeError} An error if callback is not speficied
 */
module.exports.getJSONFileContent = function(filePath, callback) {
  if (!filePath)
    return callback(new TypeError('Invalid file path, expected a string'));

  // Check if file exists
  fs.access(filePath, function(error) {

    if (!error) {

      // Read file content
      fs.readFile(filePath, {
        encoding: 'utf8'
      },
      function(error, data) {
        if (error) {
          callback(error);
        } else {
          var dataAsJson;
          try {

            // Try to parse file data as JSON content
            dataAsJson = JSON.parse(data);

          } catch (e) {
            return callback(new Error(e.message));
          }

          callback(null, dataAsJson);
        }
      });
    } else
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
 * @static
 * @async
 * @param {String} directoryPath The directory system path to create
 * @param {Function} [callback] The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
module.exports.mkdir = function(directoryPath, callback) {
  callback = callback || function(error) {
    if (error)
      process.logger.error('mkdir error', {error: error});
    else
      process.logger.silly(directoryPath + ' directory created');
  };

  if (!directoryPath)
    return callback(new TypeError('Invalid directory path, expected a string'));

  fs.access(directoryPath, function(error) {
    if (!error)
      callback();
    else
      mkdirRecursive(directoryPath, callback);
  });
};

/**
 * Removes a directory and all its content recursively and asynchronously.
 *
 * @method rmdir
 * @static
 * @async
 * @deprecated Use rm instead
 * @param {String} directoryPath Path of the directory to remove
 * @param {Function} [callback] The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
module.exports.rmdir = function(directoryPath, callback) {
  callback = callback || function(error) {
    if (error)
      process.logger.error('rmdir error', {error: error});
    else
      process.logger.silly(directoryPath + ' directory removed');
  };

  if (!directoryPath)
    return callback(new TypeError('Invalid directory path, expected a string'));

  fs.access(directoryPath, function(error) {
    if (error)
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
 * @static
 * @return {String} OpenVeo configuration directory path
 */
module.exports.getConfDir = function() {
  var env = process.env;
  var home = env.HOME;

  if (process.platform === 'win32')
    home = env.USERPROFILE || env.HOMEDRIVE + env.HOMEPATH || home || '';

  return path.join(home, '.openveo');
};

/**
 * Gets the content of a directory recursively and asynchronously.
 *
 * @method readdir
 * @static
 * @async
 * @param {String} directoryPath Path of the directory
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of resources insides the directory
 */
module.exports.readdir = function(directoryPath, callback) {
  if (!directoryPath || Object.prototype.toString.call(directoryPath) !== '[object String]')
    return callback(new TypeError('Invalid directory path, expected a string'));

  fs.stat(directoryPath, function(error, stat) {
    if (error) callback(error);
    else if (!stat.isDirectory())
      callback(new Error(directoryPath + ' is not a directory'));
    else
      readdirRecursive(directoryPath, callback);
  });
};

/**
 * Gets part of a file as bytes.
 *
 * @method readFile
 * @static
 * @async
 * @param {String} filePath Path of the file
 * @param {Number} [offset] Specify where to begin reading from in the file
 * @param {Number} [length] The number of bytes ro read
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Buffer** The buffer containing read bytes
 */
module.exports.readFile = function(filePath, offset, length, callback) {
  fs.stat(filePath, function(error, stats) {
    if (error) return callback(error);

    fs.open(filePath, 'r', function(error, fd) {
      if (error) return callback(error);

      length = length || stats.size - offset;
      length = Math.min(length, stats.size - offset);
      var buffer = Buffer.alloc(Math.min(stats.size, length));

      fs.read(fd, buffer, 0, length, offset, function(error, bytesRead, buffer) {
        fs.close(fd, function() {
          callback(error, buffer);
        });
      });
    });
  });
};

/**
 * Gets file type.
 *
 * @method getFileTypeFromBuffer
 * @static
 * @param {Buffer} file At least the first 300 bytes of the file
 * @return {String} The file type
 */
module.exports.getFileTypeFromBuffer = function(file) {
  for (var type in this.FILE_SIGNATURES) {
    for (var i = 0; i < this.FILE_SIGNATURES[type].length; i++) {
      var fileMagicNumbers = file.toString(
        'hex',
        this.FILE_SIGNATURES[type][i].offset,
        this.FILE_SIGNATURES[type][i].offset + (this.FILE_SIGNATURES[type][i].signature.length / 2)
      );

      if (fileMagicNumbers === this.FILE_SIGNATURES[type][i].signature)
        return type;
    }
  }

  return this.FILE_TYPES.UNKNOWN;
};

/**
 * Removes a resource.
 *
 * If resource is a directory, the whole directory is removed.
 *
 * @method rm
 * @static
 * @async
 * @param {String} resourcePath Path of the resource to remove
 * @param {Function} [callback] The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
module.exports.rm = function(resourcePath, callback) {
  callback = callback || function(error) {
    if (error)
      process.logger.error('rm error', {error: error});
    else
      process.logger.silly(resourcePath + ' resource removed');
  };

  if (!resourcePath)
    return callback(new TypeError('Invalid resource path, expected a string'));

  fs.stat(resourcePath, function(error, stats) {
    if (error) return callback(error);

    if (stats.isDirectory())
      rmdirRecursive(resourcePath, callback);
    else
      fs.unlink(resourcePath, callback);
  });
};
