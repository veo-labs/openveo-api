'use strict';

var path = require('path');

// Set module root directory
process.rootApi = path.join(__dirname, '../../');
process.requireApi = function(filePath) {
  return require(path.normalize(process.rootApi + '/' + filePath));
};

process.logger = process.requireApi('lib/logger.js').get('openveo');
