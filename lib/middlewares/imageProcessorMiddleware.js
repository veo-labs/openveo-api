'use strict';

/**
 * @module middlewares
 */

var fs = require('fs');
var path = require('path');
var gm = require('gm').subClass({
  imageMagick: true
});
var util = process.requireApi('lib/util.js');
var fileSystem = process.requireApi('lib/fileSystem.js');

/**
 * Generates a thumbnail from the the given image.
 *
 * @method generateThumbnail
 * @private
 * @param {String} imagePath The image absolute path
 * @param {String} cachePath The image cache path
 * @param {Number} [width] The expected image width (in px)
 * @param {Number} [height] The expected image width (in px)
 * @param {Boolean} [crop] Crop the image if the new ratio differs from original one
 * @param {Number} [quality] Expected quality from 0 to 100 (default to 90 with 100 the best)
 * @return {Function} callback Function to call when its done with:
 *   - **Error** An error if something went wrong
 */
function generateThumbnail(imagePath, cachePath, width, height, crop, quality, callback) {
  var image = gm(imagePath);

  image.size(function(error, size) {
    var ratio = size.width / size.height;
    var doCrop = crop;
    var cropPosition = {};
    var resizeWidth = width || Math.round(height * ratio);
    var resizeHeight = height || Math.round(width / ratio);

    if (doCrop && width && height) {
      if (ratio < width / height) {
        resizeHeight = Math.round(width / ratio);
        cropPosition = {x: 0, y: Math.round((resizeHeight - height) / 2)};
        doCrop = resizeHeight > height;
      } else {
        resizeWidth = Math.round(height * ratio);
        cropPosition = {x: Math.round((resizeWidth - width) / 2), y: 0};
        doCrop = resizeWidth > width;
      }
    }

    image
      .noProfile()
      .quality(quality)
      .resizeExact(resizeWidth, resizeHeight);

    if (doCrop)
      image.crop(width, height, cropPosition.x, cropPosition.y);

    image.write(cachePath, callback);
  });
}

/**
 * Defines an expressJS middleware to process images.
 *
 *     var openVeoApi = require('@openveo/api');
 *     expressApp.use('/mount-path', openVeoApi.middlewares.imageProcessorMiddleware(
 *       '/path/to/the/folder/containing/images'
 *       '/path/to/the/folder/containing/processed/images/cache'
 *       [
 *         {
 *           id: 'my-thumb', // Id of the style to apply when requesting an image processing
 *           width: 200, // Expected width (in px) of the image
 *           quality: 50 // Expected quality from 0 to 100 (default to 90 with 100 the best)
 *         }
 *       ]
 *     ));
 *
 *     // Then it's possible to apply style "my-thumb" to the image /mount-path/my-image.jpg using
 *     // parameter "style": /mount-path/my-image.jpg?style=my-thumb
 *
 * If path corresponds to an image with a parameter "style", the style is applied to the image before returning it to
 * the client. Actually only one type of manipulation can be applied to an image: generate a thumbnail.
 * If path does not correspond to an image the processor is skipped.
 *
 * @class imageProcessorMiddleware
 * @constructor
 * @static
 * @param {String} imagesDirectory The path of the directory containing the images to process
 * @param {String} cacheDirectory The path of the directory containing already processed images (for cache purpose)
 * @param {Array} styles The list of available styles to process images with for each style:
 *   - [String] **id** Id of the style to apply when requesting an image processing
 *   - [Number] **[width]** Expected width of the image (in px) (default to 10)
 *   - [Number] **[quality]** Expected quality from 0 to 100 (default to 90 with 100 the best)
 * @param {Object} headers The name / value list of headers to send with the image when responding to the client
 * @return {Function} The ExpressJS middleware
 * @throws {TypeError} If imagesdirectory or styles is empty
 */
module.exports = function(imagesDirectory, cacheDirectory, styles, headers) {
  if (!imagesDirectory) throw new TypeError('Missing imagesDirectory parameter');
  if (!styles || !styles.length) throw new TypeError('Missing styles');

  headers = headers || {};

  /**
   * Fetches a style by its id from the list of styles.
   *
   * @param {String} id The id of the style to fetch
   * @return {Object} The style description object
   */
  function fetchStyle(id) {
    for (var i = 0; i < styles.length; i++)
      if (styles[i].id === id) return styles[i];
  }

  return function(request, response, next) {
    var styleId = request.query && request.query.style;

    // No style or no file name: skip processor
    if (!styleId) return next();

    // File path without query parameters and absolute system file path
    var filePath = decodeURI(request.url.replace(/\?.*/, ''));
    var fileSystemPath = path.join(imagesDirectory, filePath);
    var isImage;

    /**
     * Sends an image to client as response.
     *
     * @param {String} imagePath The absolute image path
     */
    function sendFile(imagePath) {
      response.set(headers);
      response.download(imagePath, request.query.filename);
    }

    // Get information about the requested file
    fs.stat(fileSystemPath, function(error, stats) {

      // Error or not a file: skip image processing
      if (error || !stats.isFile()) return next();

      // Verify that file is an image
      var readable = fs.createReadStream(path.normalize(fileSystemPath), {start: 0, end: 300});
      readable.on('data', function(imageChunk) {
        try {
          util.shallowValidateObject({
            file: imageChunk
          }, {
            file: {type: 'file', required: true, in: [
              fileSystem.FILE_TYPES.JPG,
              fileSystem.FILE_TYPES.PNG,
              fileSystem.FILE_TYPES.GIF
            ]}
          });
          isImage = true;
        } catch (e) {
          isImage = false;
        }
      });

      readable.on('end', function() {

        // File is not an image: skip image processing
        if (!isImage) return next();

        var imageCachePath = path.join(cacheDirectory, styleId, filePath);

        // Find out if file has already been processed
        fs.stat(imageCachePath, function(error, stats) {

          // File was found in cache
          if (stats && stats.isFile())
            return sendFile(imageCachePath);

          // Apply style (only thumb is available right now)
          var style = fetchStyle(styleId);

          if (!style) return next();
          if (!style.width && !style.height) return next();

          // Create cache directory if it does not exist
          fileSystem.mkdir(path.dirname(imageCachePath), function(error) {
            if (error) return next(error);

            generateThumbnail(
              fileSystemPath,
              imageCachePath,
              style.width,
              style.height,
              style.crop,
              style.quality,
              function(error) {
                if (error) return next(error);

                sendFile(imageCachePath);
              }
            );

          });

        });
      });
    });
  };
};
