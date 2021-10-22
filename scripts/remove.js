#!/usr/bin/env node

/**
 * Removes resources from file system.
 *
 * Usage:
 *
 * $ node remove directory1
 * $ node remove directory1/*
 * $ node remove file1
 * $ node remove file1 file2 directory1
 */

'use strict';

require('../processRequire.js');

const fs = require('fs/promises');
const path = require('path');
const util = require('util');

const fileSystem = process.requireApi('lib/fileSystem.js');

/**
 * Removes given resource.
 *
 * @param {String} resourcePath The path of the resource to remove, if it terminates by a wildcard the content of the
 * directory will be removed but not the directory itself
 * @return {Promise} Promise resolving when the given resource has been removed
 */
async function remove(resourcePath) {
  let keepDirectory = false;

  if (/\*$/.test(resourcePath)) {
    resourcePath = path.dirname(resourcePath);
    keepDirectory = true;
  }

  try {
    await fs.access(resourcePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    } else {
      return Promise.resolve();
    }
  }

  await util.promisify(fileSystem.rm)(resourcePath, keepDirectory);
}

/**
 * Removes resource.
 */
async function main() {
  const resourcesPaths = process.argv.slice(2);
  const promises = [];

  for (let resourcePath of resourcesPaths) {
    promises.push(remove(resourcePath));
  }

  await Promise.all(promises);
}

main();
