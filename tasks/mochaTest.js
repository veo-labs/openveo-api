'use strict';

module.exports = {

  // API unit tests
  api: {
    options: {
      reporter: 'spec'
    },
    src: [
      'tests/server/init.js',
      'tests/server/api/*.js',
      'tests/server/controllers/*.js',
      'tests/server/database/*.js',
      'tests/server/emitters/*.js',
      'tests/server/fileSystem/*.js',
      'tests/server/models/*.js',
      'tests/server/providers/*.js',
      'tests/server/socket/*.js',
      'tests/server/grunt/*.js',
      'tests/server/util/*.js',
      'tests/server/plugin/*.js',
      'tests/server/middlewares/*.js'
    ]
  }

};
