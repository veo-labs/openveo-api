#!/usr/bin/env node

/**
 * Deploys project's documentation to Github pages.
 *
 * Project documentation should be in a directory named after the project's version.
 * This script can be launched from any project having @openveo/api as a dependency to deploy project's documentation.
 *
 * Documentation is desployed on the project's "gh-pages" branch.
 * "gh-pages" branch must exist before calling this script.
 * Project's repository is cloned inside a temporary directory, the documentation is copied to the clone and pushed.
 *
 * Usage:
 *
 * # Deploy directory site/7.0.0 into "gh-pages" branch
 * $ npx ovDeployGithubPages site/7.0.0
 */

'use strict';

require('../processRequire.js');

const {exec, spawn} = require('child_process');
const {nanoid} = require('nanoid');
const path = require('path');
const os = require('os');
const util = require('util');
const projectConfiguration = process.requireApi('package.json');
const fileSystem = process.requireApi('lib/fileSystem.js');

const documentationPath = path.join(process.cwd(), process.argv[2]);

/**
 * Logs given message to stdout with a prefix.
 *
 * @param {String} message the message to log
 */
function log(message) {
  console.log(`${projectConfiguration.name}.deployGithubPages > ${message}`);
}

/**
 * Gets Git remote URL of the project from which the script has been launched.
 *
 * @async
 * @return {Promise} Promise resolving with the Git remote URL
 */
async function getRemoteUrl() {
  return new Promise((resolve, reject) => {
    const command = 'git config --get remote.origin.url';
    log(`${process.cwd()} > Get repository URL > ${command}`);
    exec(command, {cwd: process.cwd()}, (error, stdout, stderr) => {
      if (error) return reject(error);
      return resolve(stdout.replace(/[\r\n]/, ''));
    });
  });
}

/**
 * Clones given repository branch into given directory.
 *
 * @async
 * @param {String} repositoryUrl The Git repository URL to clone
 * @param {String} branch The branch to clone
 * @param {String} clonePath The destination directory to clone the repository to
 * @return {Promise} Promise resolving when repository has been cloned
 */
async function cloneRepository(repositoryUrl, branch, clonePath) {
  return new Promise((resolve, reject) => {
    const command = `git clone ${repositoryUrl} ${clonePath} --branch ${branch} --single-branch`;
    log(`Clone branch ${branch} of repository ${repositoryUrl} > ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(error);
      return resolve();
    });
  });
}

/**
 * Adds given directory to staged files of a repository.
 *
 * @async
 * @param {String} repositoryPath The absolute path of the directory containing the repository
 * @param {String} directory The path of the directory to stage relative to respositoryPath
 * @return {Promise} Promise resolving when files have been staged
 */
async function stageDirectory(repositoryPath, directory) {
  return new Promise((resolve, reject) => {
    const command = `git add ${directory}`;
    log(`${repositoryPath} > Stage changes > ${command}`);
    exec(command, {cwd: repositoryPath}, (error, stdout, stderr) => {
      if (error) return reject(error);
      return resolve();
    });
  });
}

/**
 * Commits given repository changes if there is something to commit.
 *
 * @async
 * @param {String} repositoryPath The absolute path of the directory containing the repository
 * @param {String} message The commit message
 * @return {Promise} Promise resolving when commit has been made or there is nothing to commit
 */
async function commit(repositoryPath, message) {
  return new Promise((resolve, reject) => {
    const command = 'git diff-index --quiet HEAD .';
    log(`${repositoryPath} > Test if something has been staged > ${command}`);
    exec(command, {cwd: repositoryPath}, (error, stdout, stderr) => {
      if (error) {
        const command = `git commit -m "${message}"`;
        log(`${repositoryPath} > Commit staged files > ${command}`);
        exec(command, {cwd: repositoryPath}, (error, stdout, stderr) => {
          if (error) return reject(error);
          return resolve();
        });
      } else {
        log(`${repositoryPath} > Nothing to commit`);
        return resolve();
      }
    });
  });
}

/**
 * Pushes given repository commits into the given branch.
 *
 * @async
 * @param {String} repositoryPath The absolute path of the directory containing the repository
 * @param {String} branch The branch to push to
 * @return {Promise} Promise resolving when push has been made
 */
async function push(repositoryPath, branch) {
  return new Promise((resolve, reject) => {
    let errorOutput = '';

    log(`${repositoryPath} > Push commits > git push origin ${branch}`);

    const gitProcess = spawn('git', [
      'push',
      'origin',
      branch
    ], {cwd: repositoryPath});

    gitProcess.stderr.setEncoding('utf8');
    gitProcess.stdout.on('error', (error) => reject(error));
    gitProcess.on('error', (error) => reject(error));
    gitProcess.on('exit', (code, signal) => {
      if (code > 0) {
        return reject(new Error(`Push failed with code ${code}\n${errorOutput}`));
      }

      return resolve();
    });
    gitProcess.stderr.on('readable', () => {
      let data;

      // eslint-disable-next-line no-cond-assign
      while (data = gitProcess.stderr.read()) {
        errorOutput += data;
      }

    });
  });
}

/**
 * Deploys documentation to Github pages.
 */
async function main() {
  const branch = 'gh-pages';
  const temporaryRootDirectory = path.join(os.tmpdir(), nanoid());
  const clonePath = path.join(temporaryRootDirectory, projectConfiguration.name, branch);
  const version = path.basename(documentationPath);

  try {
    const repositoryUrl = await getRemoteUrl();
    log(`Repository URL is ${repositoryUrl}`);

    await cloneRepository(repositoryUrl, branch, clonePath);

    log(`${clonePath} > Remove directory ${version}`);
    await util.promisify(fileSystem.rmdir)(path.join(clonePath, version));

    log(`${clonePath} > Copy ${documentationPath} into ${version}`);
    await util.promisify(fileSystem.copy.bind(fileSystem))(documentationPath, path.join(clonePath, version));

    await stageDirectory(clonePath, version);
    await commit(clonePath, `Auto-generated documentation for version ${version}`);
    await push(clonePath, branch);

    log(`Remove temporary directory ${temporaryRootDirectory}`);
    await util.promisify(fileSystem.rmdir)(temporaryRootDirectory);

  } catch (error) {
    await util.promisify(fileSystem.rmdir)(temporaryRootDirectory);
    throw error;
  }
}

main();
