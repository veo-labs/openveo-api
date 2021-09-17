#!/usr/bin/env node

/**
 * Watches directories for changes and executes an NPM script when a file has changed.
 *
 * Watcher is recursive and will watch all files inside a directory and its sub directories.
 * If a new file is added it won't run the command on creation, make a modification on the file and save it to force
 * run the command.
 *
 * Usage:
 *
 * # Watch for changes in directories path/to/directory1 and path/to/directory2 recursively
 * # Execute command `npm run build̀` when a file changes
 * # Only files with extensions scss, css, js, json or HTML are watched
 * $ node watch \
 *   --directory="path/to/directory1" \
 *   --directory="path/to/directory2" \
 *   --command="build" \
 *   --extensions="scss|css|js|json|html"
 *
 * # Same as previous example but using shorthands
 * $ node watch -d path/to/directory1 -d path/to/directory2 -c build -e "scss|css|js|json|html"
 */

'use strict';

require('../processRequire.js');

const {exec} = require('child_process');
const path = require('path');
const nopt = require('nopt');
const Watcher = process.requireApi('lib/watcher/Watcher.js');
const projectConfiguration = process.requireApi('package.json');

// Process arguments
const knownProcessOptions = {
  directory: [path, Array],
  command: [String],
  extensions: [String]
};
const processOptions = nopt(knownProcessOptions, null, process.argv);
processOptions.extensions = processOptions.extensions || 'scss|css|js|json|html';

let commandProcess;
let abortController;
let lastResourceDeleted;
let watchedFiles = new Set();

/**
 * Logs given message to stdout with a prefix.
 *
 * @param {String} message the message to log
 */
function log(message) {
  console.log(`${projectConfiguration.name}.watch > ${message}`);
}

/**
 * Runs the NPM script command.
 */
function runCommand() {
  if (commandProcess) {
    abortController.signal.addEventListener('abort', () => {
      commandProcess = null;
      runCommand();
    });
    return abortController.abort();
  }

  const command = `npm run ${processOptions.command}`;
  abortController = new AbortController();
  commandProcess = exec(command, {
    cwd: process.cwd(),
    signal: abortController.signal
  }, (error, stdout, stderr) => {
    if (error && error.code !== 'ABORT_ERR') console.log(error);
    console.log(stdout);
    commandProcess = null;
  });
}

/**
 * Starts watching for files system changes.
 */
function main() {
  const directoryWatcher = new Watcher({
    stabilityThreshold: 10
  });

  // Ask watcher to watch directories
  directoryWatcher.add(processOptions.directory, function(results) {

    // When a file is modified, it receives a "delete" followed by a "create"
    const handleChanges = (resourcePath, deleted) => {
      if (new RegExp(`.*\\.(${processOptions.extensions})$`).test(resourcePath)) {
        if (deleted) {
          lastResourceDeleted = resourcePath;
        } else if (lastResourceDeleted === resourcePath) {

          // File has been modified
          lastResourceDeleted = null;
          return;

        }

        if (!watchedFiles.has(resourcePath)) {
          watchedFiles.add(resourcePath);
          return;
        }
        log(`File ${resourcePath} changed`);
        runCommand();
      }
    };

    directoryWatcher.on('create', (resourcePath) => handleChanges(resourcePath));
    directoryWatcher.on('delete', (resourcePath) => handleChanges(resourcePath, true));
    directoryWatcher.on('error', (error) => {
      throw error;
    });

  });

  // Make watch run forever
  setInterval(() => {}, 1000 * 60 * 60);
}

main();
