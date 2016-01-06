'use strict';

// Module dependencies
var path = require('path');

// Set module root directory
process.root = path.join(__dirname, './root/');
process.rootAPI = path.join(__dirname, '../../');
process.requireAPI = function(filePath) {
  return require(path.normalize(process.rootAPI + '/' + filePath));
};

process.logger = process.requireAPI('lib/logger.js').get('openveo');
