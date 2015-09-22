'use strict';

module.exports = {

  // API doc
  api: {
    name: '<%= pkg.name %>',
    description: '<%= pkg.description %>',
    version: '<%= pkg.version %>',
    options: {
      paths: 'lib',
      outdir: './doc/api',
      linkNatives: true
    }
  }

};
