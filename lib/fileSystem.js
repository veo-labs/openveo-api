'use strict';

/**
 * Defines functions to interact with the file system as an extension to the Node.js filesystem module.
 *
 * @example
 * // Load module "fileSystem"
 * var fsApi = require('@openveo/api').fileSystem;
 *
 * @module fileSystem
 */

var fs = require('fs');
var path = require('path');
var stream = require('stream');
var util = require('util');

var nanoid = require('nanoid').nanoid;
var tar = require('tar-fs');

/**
 * Creates a directory recursively and asynchronously.
 *
 * If parent directories do not exist, they will be automatically created.
 *
 * @method mkdirRecursive
 * @private
 * @param {String} directoryPath The directory system path to create
 * @param {callback} callback The function to call when done
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
 * @param {String} directoryPath Path of the directory to remove
 * @param {Boolean} keepDirectory true to keep the directory in case the resource is a directory, false to also remove
 * the directory
 * @param {callback} callback The function to call when done
 */
function rmdirRecursive(directoryPath, keepDirectory, callback) {
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
      if (!keepDirectory) fs.rmdir(directoryPath, terminate);
      else terminate();

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

          resources = rmdirRecursive(path.join(directoryPath, resource), false, function(error) {
            if (terminated) return;
            if (error)
              return terminate(error);

            pendingResourceNumber--;

            if (!pendingResourceNumber) {
              if (!keepDirectory) fs.rmdir(directoryPath, terminate);
              else terminate();
            }

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

              if (!pendingResourceNumber) {
                if (!keepDirectory) fs.rmdir(directoryPath, terminate);
                else terminate();
              }
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
 * @param {String} directoryPath Path of the directory
 * @param {module:fileSystem~readdirRecursiveCallback} callback The function to call when done
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
 * @param {String} sourceFilePath Path of the file
 * @param {String} destinationFilePath Final path of the file
 * @param {callback} callback The function to call when done
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
 * Substitutes matching patterns in each line by something else.
 *
 * @class ReplaceTransformStream
 * @extends stream.Transform
 * @constructor
 * @private
 * @ignore
 * @param {Array} substitutions The list of substitutions
 * @param {RegExp} substitutions[].pattern The regular expression to test for each line
 * @param {String} substitutions[].replacement The regular expression matching replacement
 */
function ReplaceTransformStream(substitutions) {
  if (!(this instanceof ReplaceTransformStream))
    return new ReplaceTransformStream();

  stream.Transform.call(this);

  Object.defineProperties(this,

    /** @lends module:fileSystem~ReplaceTransformStream */
    {

      /**
       * Incomplete line if read stop before the end of a line.
       *
       * @type {(String|null)}
       * @instance
       */
      incompleteLine: {value: null, writable: true},

      /**
       * The list of substitutions to apply.
       *
       * @type {Array}
       * @instance
       * @readonly
       */
      substitutions: {value: substitutions}

    }

  );
}

util.inherits(ReplaceTransformStream, stream.Transform);

ReplaceTransformStream.prototype._transform = function(data, encoding, callback) {
  var self = this;
  var dataAsString = data.toString();

  if (this.incompleteLine) {
    dataAsString = this.incompleteLine + dataAsString;
  }

  var lines = dataAsString.split('\n');

  lines = lines.map(function(line) {
    var modifiedLine = line;

    for (var substitution of self.substitutions) {
      modifiedLine = modifiedLine.replace(substitution.pattern, substitution.replacement);
    }

    return modifiedLine;
  });

  this.incompleteLine = lines.splice(lines.length - 1, 1)[0];
  this.push(lines.join('\n'));

  callback();
};

ReplaceTransformStream.prototype._flush = function(callback) {
  if (this.incompleteLine) {
    this.push('\n' + this.incompleteLine);
  }

  this.incompleteLine = null;
  callback();
};

/**
 * Prepends given data before anything else.
 *
 * @class PrependTransformStream
 * @extends stream.Transform
 * @constructor
 * @private
 * @ignore
 * @param {String} data The data to prepend
 */
function PrependTransformStream(data) {
  if (!(this instanceof PrependTransformStream))
    return new PrependTransformStream();

  stream.Transform.call(this);

  Object.defineProperties(this,

    /** @lends module:fileSystem~PrependTransformStream */
    {

      /**
       * The data to prepend.
       *
       * @type {String}
       * @instance
       * @readonly
       */
      data: {value: data},

      /**
       * Indicate if prepend has been made or not.
       *
       * @type {Boolean}
       * @instance
       */
      done: {value: false, writable: true}

    }

  );
}

util.inherits(PrependTransformStream, stream.Transform);

PrependTransformStream.prototype._transform = function(data, encoding, callback) {
  if (!this.done) {
    this.push(this.data);
    this.done = true;
  }

  this.push(data.toString());

  callback();
};

/**
 * The list of file types.
 *
 * @const
 * @type {Object}
 * @default
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
 * @const
 * @type {Object}
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
 * @param {String} filePath Path of the file to extract
 * @param {String} destinationPath Path of the directory where to
 * extract files
 * @param {callback} [callback] The function to call when done
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
 * @param {String} sourcePath Path of the source to copy
 * @param {String} destinationSourcePath Final path of the source
 * @param {callback} callback The function to call when done
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
 * @param {String} filePath The path of the file to read
 * @param {module:fileSystem~getJSONFileContentCallback} callback The function to call when done
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
 * @param {String} directoryPath The directory system path to create
 * @param {callback} [callback] The function to call when done
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
 * @deprecated Use rm instead
 * @param {String} directoryPath Path of the directory to remove
 * @param {Boolean} [keepDirectory=false] true to keep the directory, false to also remove the directory
 * @param {callback} [callback] The function to call when done
 */
module.exports.rmdir = function(directoryPath, keepDirectory, callback) {
  if (typeof keepDirectory === 'function') {
    callback = keepDirectory;
    keepDirectory = false;
  }
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
      rmdirRecursive(directoryPath, keepDirectory, callback);
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
 * @param {String} directoryPath Path of the directory
 * @param {module:fileSystem~readdirCallback} callback The function to call when done
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
 * @param {String} filePath Path of the file
 * @param {Number} [offset] Specify where to begin reading from in the file
 * @param {Number} [length] The number of bytes ro read
 * @param {module:fileSystem~readFileCallback} callback The function to call when done
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
 * @param {String} resourcePath Path of the resource to remove
 * @param {Boolean} [keepDirectory=false] true to keep the directory in case the resource is a directory, false to also
 * remove the directory
 * @param {callback} [callback] The function to call when done
 */
module.exports.rm = function(resourcePath, keepDirectory, callback) {
  if (typeof keepDirectory === 'function') {
    callback = keepDirectory;
    keepDirectory = false;
  }
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
      rmdirRecursive(resourcePath, keepDirectory, callback);
    else
      fs.unlink(resourcePath, callback);
  });
};

/**
 * Replaces strings matching a pattern inside a file.
 *
 * @param {String} filePath The system path of the file to parse
 * @param {Array} substitutions The list of substitutions
 * @param {RegExp} substitutions[].pattern The regular expression to test for each line
 * @param {String} substitutions[].replacement The regular expression matching replacement
 * @param {callback} [callback] The function to call when done
 */
module.exports.replace = function(filePath, substitutions, callback) {
  if (!substitutions || !substitutions.length) return callback();
  var self = this;
  var temporaryId = nanoid();
  var file = path.parse(filePath);
  var temporaryFilePath = path.join(file.dir, file.name + temporaryId + file.ext);
  var fileInputStream = fs.createReadStream(filePath);
  var fileOutputStream = fs.createWriteStream(temporaryFilePath);
  var transformStream = new ReplaceTransformStream(substitutions);
  var handleError = function(error) {
    self.rm(temporaryFilePath, function() {
      callback(error);
    });
  };

  fileInputStream.pipe(transformStream).pipe(fileOutputStream);

  fileInputStream.on('error', handleError);
  fileOutputStream.on('error', handleError);
  fileOutputStream.on('finish', function() {
    fs.rename(temporaryFilePath, filePath, callback);
  });
};

/**
 * Prepends given data to file.
 *
 * @param {String} filePath The system path of the file to add data to
 * @param {String} data Data to add to the beginning of the file
 * @param {callback} [callback] The function to call when done
 */
module.exports.prepend = function(filePath, data, callback) {
  if (!data) return callback();
  var self = this;
  var temporaryId = nanoid();
  var file = path.parse(filePath);
  var temporaryFilePath = path.join(file.dir, file.name + temporaryId + file.ext);
  var fileInputStream = fs.createReadStream(filePath);
  var fileOutputStream = fs.createWriteStream(temporaryFilePath);
  var transformStream = new PrependTransformStream(data);
  var handleError = function(error) {
    self.rm(temporaryFilePath, function() {
      callback(error);
    });
  };

  fileInputStream.pipe(transformStream).pipe(fileOutputStream);

  fileInputStream.on('error', handleError);
  fileOutputStream.on('error', handleError);
  fileOutputStream.on('finish', function() {
    fs.rename(temporaryFilePath, filePath, callback);
  });
};

/**
 * @callback module:fileSystem~readdirRecursiveCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {Array} stats The list of fs.Stats corresponding to resources inside the directory (files and directories)
 */

/**
 * @callback module:fileSystem~getJSONFileContentCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(String|null)} content The file content or null if an error occurred
 */

/**
 * @callback module:fileSystem~readdirCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Array|Undefined)} resources The list of resources insides the directory
 */

/**
 * @callback module:fileSystem~readFileCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Buffer|Undefined)} buffer The buffer containing read bytes
 */
