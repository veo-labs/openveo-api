'use strict';

/**
 * Defines functions to manipulate images.
 *
 *     // Load module "imageProcessor"
 *     var fsApi = require('@openveo/api').imageProcessor;
 *
 * @module imageProcessor
 * @main imageProcessor
 * @class imageProcessor
 * @static
 */

var gm = require('gm').subClass({
  imageMagick: true
});

/**
 * Generates a thumbnail from the given image.
 *
 * @method generateThumbnail
 * @param {String} imagePath The image absolute path
 * @param {String} thumbnailPath The thumbnail path
 * @param {Number} [width] The expected image width (in px)
 * @param {Number} [height] The expected image height (in px)
 * @param {Boolean} [crop] Crop the image if the new ratio differs from original one
 * @param {Number} [quality] Expected quality from 0 to 100 (default to 90 with 100 the best)
 * @return {Function} callback Function to call when its done with:
 *   - **Error** An error if something went wrong
 */
module.exports.generateThumbnail = function(imagePath, thumbnailPath, width, height, crop, quality, callback) {
  var image = gm(imagePath);

  image.size(function(error, size) {
    var ratio = size.width / size.height;
    var cropPosition = {};
    var resizeWidth = width || Math.round(height * ratio);
    var resizeHeight = height || Math.round(width / ratio);

    if (crop && width && height) {
      if (ratio < width / height) {
        resizeHeight = Math.round(width / ratio);
        cropPosition = {x: 0, y: Math.round((resizeHeight - height) / 2)};
        crop = resizeHeight > height;
      } else {
        resizeWidth = Math.round(height * ratio);
        cropPosition = {x: Math.round((resizeWidth - width) / 2), y: 0};
        crop = resizeWidth > width;
      }
    }

    image
      .noProfile()
      .quality(quality)
      .resizeExact(resizeWidth, resizeHeight);

    if (crop)
      image.crop(width, height, cropPosition.x, cropPosition.y);

    image.write(thumbnailPath, callback);
  });
};
