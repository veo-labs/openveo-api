'use strict';

/**
 * @module multipart
 */

var fs = require('fs');
var path = require('path');
var multer = require('multer');
var async = require('async');
var fileSystem = process.requireApi('lib/fileSystem.js');

/**
 * Defines a multipart parser to parse multipart requests.
 *
 * Use MultipartParser to get fields from multipart requests (including files).
 *
 * @example
 *
 *     // Get multipart parser
 *     var MultipartParser = require('@openveo/api').multipart.MultipartParser;
 *
 *     // Create a request parser expecting several files: files in photos "field" and a file in "videos" field
 *     var parser = new MultipartParser(request, [
 *       {
 *         name: 'photos',
 *         destinationPath: '/tmp/photos',
 *         maxCount: 2
 *       },
 *       {
 *         name: 'videos',
 *         destinationPath: '/tmp/videos',
 *         maxCount: 1
 *       }
 *     ], {
 *       fieldNameSize: 100,
 *       fieldSize: 1024,
 *       fields: Infinity,
 *       fileSize: Infinity,
 *       files: Infinity,
 *       parts: Infinity,
 *       headerPairs: 2000
 *     });
 *
 *     parser.parse(function(error) {
 *       if (error)
 *         console.log('Something went wrong when uploading');
 *       else
 *         console.log(request.files);
 *     });
 *
 * @class MultipartParser
 * @constructor
 * @param {Request} request HTTP Request containing a multipart body, it will be altered with parsing properties
 * @param {Array} fileFields A list of file field descriptors with:
 *   - {String} name The field name which contains the file
 *   - {String} destinationPath The destination directory where the file will be uploaded
 *   - {Number} [maxCount] The maximum number of files allowed for this field
 * @param {Object} [limits] Multipart limits configuration, for more information about
 * available limits see Multer documentation (https://www.npmjs.com/package/multer#limits).
 * @throws {TypeError} If request is not as expected
 */
function MultipartParser(request, fileFields, limits) {
  Object.defineProperties(this, {

    /**
     * The HTTP request containing a multipart body.
     *
     * @property request
     * @type Request
     * @final
     */
    request: {value: request},

    /**
     * The list of file field descriptors.
     *
     * @property fileFields
     * @type Array
     * @final
     */
    fileFields: {value: fileFields || []},

    /**
     * Multipart limits configuration.
     *
     * @property limits
     * @type Object
     * @final
     */
    limits: {value: limits},

    /**
     * Final paths of files detected in multipart body.
     *
     * @property detectedFilesPaths
     * @type Array
     * @final
     */
    detectedFilesPaths: {value: []}

  });

  if (!this.request)
    throw new TypeError('A MultipartParser needs a request');
}

module.exports = MultipartParser;

/**
 * Gets fields configuration by name.
 *
 * @method getField
 * @param {String} fieldName The name of the field containing files
 * @return {Object|Null} The field configuration
 */
MultipartParser.prototype.getField = function(fieldName) {
  for (var i = 0; i < this.fileFields.length; i++)
    if (this.fileFields[i].name === fieldName) return this.fileFields[i];

  return null;
};

/**
 * Builds final file name.
 *
 * It avoids collisions with existing files and sanitizes file name.
 *
 * @method getFileName
 * @async
 * @param {String} originalFileName The original file name
 * @param {String} fieldName The name of the field containing the file
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **String** The computed file name
 */
MultipartParser.prototype.getFileName = function(originalFileName, fieldName, callback) {
  var extension = path.extname(originalFileName);
  var basename = path.basename(originalFileName, extension);
  var sanitizedFilename = basename.replace(/[^a-z0-9\-]/gi, '-').replace(/\-{2,}/g, '-').toLowerCase();
  var field = this.getField(fieldName);

  if (!field.destinationPath)
    return callback(new Error('No destination path found for field ' + fieldName));

  // Test if file already exists
  fs.stat(path.join(field.destinationPath, sanitizedFilename + extension), function(error, stat) {
    var uploadedFileName;
    if (error) {
      if (error.code == 'ENOENT') {

        // File does not exist
        uploadedFileName = sanitizedFilename + extension;

      } else
        return callback(error);
    } else {

      // File already exists
      // Add timestamp to the name of the file
      uploadedFileName = sanitizedFilename + '-' + Date.now() + extension;

    }

    callback(null, uploadedFileName);
  });
};

/**
 * Parses multipart content of the request and performs uploads if any.
 *
 * @method parse
 * @async
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 */
MultipartParser.prototype.parse = function(callback) {
  var self = this;

  // Multer does not remove partially parsed files when client aborts the request
  // Remove files being written to the disk when client aborts the request
  this.request.on('aborted', function() {
    var asyncFunctions = [];
    self.detectedFilesPaths.forEach(function(detectedFilePath) {
      asyncFunctions.push(function(callback) {
        fileSystem.rm(detectedFilePath, callback);
      });
    });

    async.parallel(asyncFunctions, function() {
      callback(new Error('Parsing aborted by client. Temporary files have been removed'));
    });
  });

  multer({
    storage: multer.diskStorage({
      destination: function(request, file, callback) {
        var field = self.getField(file.fieldname);

        if (field.destinationPath) {
          fileSystem.mkdir(field.destinationPath, function(error) {
            callback(error, field.destinationPath);
          });
        } else callback(new Error('No destination path found for field ' + file.fieldname));
      },
      filename: function(request, file, callback) {
        var field = self.getField(file.fieldname);

        self.getFileName(file.originalname, file.fieldname, function(error, fileName) {
          if (error) return callback(error);
          self.detectedFilesPaths.push(path.join(field.destinationPath, fileName));
          callback(null, fileName);
        });
      }
    }),
    limits: this.limits
  }).fields(this.fileFields)(this.request, null, function(error) {
    callback(error);
  });
};
