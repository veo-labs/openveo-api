'use strict';

/**
 * @module grunt
 */

var path = require('path');
var fs = require('fs');
var async = require('async');
var esprima = require('esprima');
var utilApi = process.requireApi('lib/util.js');
var expressionFactory = process.requireApi('lib/grunt/ngDpTask/expressionFactory.js');
var ElementExpression = process.requireApi('lib/grunt/ngDpTask/ElementExpression.js');
var InjectExpression = process.requireApi('lib/grunt/ngDpTask/InjectExpression.js');
var ConfigExpression = process.requireApi('lib/grunt/ngDpTask/ConfigExpression.js');
var RouteExpression = process.requireApi('lib/grunt/ngDpTask/RouteExpression.js');
var FilterExpression = process.requireApi('lib/grunt/ngDpTask/FilterExpression.js');

/**
 * Finds out AngularJS definitions and dependencies for the given content.
 *
 * This is recursive.
 *
 * The following JavaScript expressions are used to identify definitions:
 *   - angular.module('moduleName', [])
 *   - angular.module('moduleName').component()
 *   - angular.module('moduleName').directive()
 *   - angular.module('moduleName').controller()
 *   - angular.module('moduleName').factory()
 *   - angular.module('moduleName').service()
 *   - angular.module('moduleName').constant()
 *   - angular.module('moduleName').service()
 *   - angular.module('moduleName').decorator()
 *   - angular.module('moduleName').filter()
 *   - angular.module('moduleName').config()
 *   - angular.module('moduleName').run()
 *
 * The following JavaScript expressions are used to identify dependencies:
 *   - MyAngularJsElement.$inject = ['Dependency1', 'Dependency2'];
 *   - angular.module('moduleName', ['DependencyModule'])
 *
 * The following JavaScript expressions are used to identify associated modules:
 *   - angular.module('moduleName')
 *
 * @method findDependencies
 * @param {Object} expression The JavaScript expression to analyze
 * @private
 */
function findDependencies(jsExpression) {
  var expression;
  var results = {
    definitions: [],
    dependencies: [],
    module: null
  };
  if (!jsExpression) return results;

  /**
   * Merges results from sub expressions into results for the current expression.
   *
   * @param {Object} newResults Sub expressions results
   * @param {Array} [newResults.definitions] The list of definitions in sub expression
   * @param {Array} [newResults.dependencies] The list of dependencies in sub expression
   * @param {String} [newResults.module] The name of the module the definitions belong to
   */
  function mergeResults(newResults) {
    if (newResults.definitions)
      results.definitions = utilApi.joinArray(results.definitions, newResults.definitions);

    if (newResults.dependencies)
      results.dependencies = utilApi.joinArray(results.dependencies, newResults.dependencies);

    if (newResults.module)
      results.module = newResults.module;
  }

  if (jsExpression.type === 'CallExpression' && jsExpression.callee.type === 'MemberExpression') {
    if (Object.values(ElementExpression.ELEMENTS).indexOf(jsExpression.callee.property.name) > -1) {
      expression = expressionFactory.getElementExpression(jsExpression.callee.property.name, jsExpression);
      if (expression.isValid()) {
        var newResults = {
          definitions: expression.isDefinition() ? [expression.getName()] : [],
          dependencies: expression.getDependencies()
        };

        if (!expression.isDefinition() && expression.getElementType() === ElementExpression.ELEMENTS.MODULE)
          newResults.module = expression.getName();

        mergeResults(newResults);
      }
    } else if (jsExpression.callee.property.name === 'config' || jsExpression.callee.property.name === 'run') {
      expression = new ConfigExpression(jsExpression);

      if (expression.isValid()) {
        mergeResults({
          dependencies: expression.getDependencies()
        });
      }
    } else if (jsExpression.callee.property.name === 'when') {
      expression = new RouteExpression(jsExpression);

      if (expression.isValid()) {
        mergeResults({
          definitions: expression.getDefinitions(),
          dependencies: expression.getDependencies()
        });
      }
    }
  }

  if (jsExpression.type === 'AssignmentExpression' &&
      jsExpression.left.property &&
      jsExpression.left.property.name === '$inject'
  ) {
    expression = new InjectExpression(jsExpression);

    if (expression.isValid()) {
      mergeResults({
        dependencies: expression.getDependencies()
      });
    }
  }

  if (jsExpression.type === 'CallExpression' && jsExpression.callee.name === '$filter') {
    expression = new FilterExpression(jsExpression);

    if (expression.isValid()) {
      mergeResults({
        dependencies: [expression.getDependency()]
      });
    }
  }

  if (Object.prototype.toString.call(jsExpression) === '[object Object]') {
    for (var property in jsExpression)
      mergeResults(findDependencies(jsExpression[property]));
  } else if (Object.prototype.toString.call(jsExpression) === '[object Array]') {
    jsExpression.forEach(function(value) {
      mergeResults(findDependencies(value));
    });
  }

  return results;
}

/**
 * Fetches a script from a list of scripts.
 *
 * @method findScript
 * @param {Array} scripts The list of scripts
 * @param {String} property The script property used to identify the script to fetch
 * @param {String} value The expected value of the script property
 * @return {Object|Null} The found script or null if not found
 * @private
 */
function findScript(scripts, property, value) {
  for (var i = 0; i < scripts.length; i++) {
    if ((Object.prototype.toString.call(scripts[i][property]) === '[object Array]' &&
        scripts[i][property].indexOf(value) > -1) ||
        (scripts[i][property] === value)
    ) {
      return scripts[i];
    }
  }

  return null;
}

/**
 * Browses a flat list of scripts to find a script longest dependency chains.
 *
 * Each script may have several dependencies, each dependency can also have several dependencies.
 * findLongestDependencyChains helps find the longest dependency chain of one of the script.
 * As the script may have several longest dependency chain, a list of chains is returned.
 *
 * A chain is an ordered list of script paths.
 *
 * This is recursive.
 *
 * @method findLongestDependencyChains
 * @param {Array} scripts The flat list of scripts with for each script:
 *  - **dependencies** The list of dependency names of the script
 *  - **definitions** The list of definition names of the script
 *  - **path** The script path
 * @param {Object} [script] The script to analyze (default to the first one of the list of scripts)
 * @return {Array} The longest dependency chains
 * @private
 */
function findLongestDependencyChains(scripts, script) {
  var chains = [];

  if (!script) script = scripts[0];

  // Get script dependencies
  if (script.dependencies && script.dependencies.length) {
    var longestChainLength;

    // Find dependency chains of the script
    script.dependencies.forEach(function(dependency) {
      var definitionScript = findScript(scripts, 'definitions', dependency);

      if (definitionScript)
        chains = chains.concat(chains, findLongestDependencyChains(scripts, definitionScript));
    });

    if (chains.length > 0) {

      // Keep the longest chain(s)
      chains.sort(function(chain1, chain2) {
        // -1 : chain1 before chain2
        // 0 : nothing change
        // 1 : chain1 after chain2

        if (chain1.length > chain2.length)
          return -1;
        else if (chain1.length < chain2.length)
          return 1;
        else return 0;
      });

      longestChainLength = chains[0].length;

      chains = chains.filter(function(chain) {
        if (chain.length === longestChainLength) {
          chain.push(script.path);
          return true;
        }

        return false;
      });

      return chains;
    }
  }

  chains.push([script.path]);
  return chains;
}

/**
 * Builds the dependencies tree.
 *
 * @method buildTree
 * @param {Array} scripts The flat list of scripts with for each script:
 *  - **dependencies** The list of dependency names of the script
 *  - **definitions** The list of definition names of the script
 *  - **path** The script path
 * @return {Array} The list of scripts with their dependencies
 * @private
 */
function buildTree(scripts) {
  var chains = [];
  var tree = {
    children: []
  };
  var currentTreeNode = tree;

  // Get the longest dependency chain for each script with the highest dependency
  // as the first element of the chain
  scripts.forEach(function(script) {
    chains = chains.concat(findLongestDependencyChains(scripts, script));
  });

  // Sort chains by length with longest chains first
  chains.sort(function(chain1, chain2) {
    // -1 : chain1 before chain2
    // 0 : nothing change
    // 1 : chain1 after chain2

    if (chain1.length > chain2.length)
      return -1;
    else if (chain1.length < chain2.length)
      return 1;
    else return 0;
  });

  // Add each chain to the tree
  chains.forEach(function(chain) {

    // Add each element of the chain as a child of its parent
    chain.forEach(function(scriptPath) {
      var currentScript = findScript(scripts, 'path', scriptPath);
      var alreadyExists = false;

      if (!currentTreeNode.children)
        currentTreeNode.children = [];

      // Check if current script does not exist in node children
      for (var i = 0; i < currentTreeNode.children.length; i++) {
        if (currentTreeNode.children[i].path === currentScript.path) {
          alreadyExists = true;
          break;
        }
      }

      // Add script to the tree
      if (!alreadyExists)
        currentTreeNode.children.push(currentScript);

      currentTreeNode = currentScript;
    });

    currentTreeNode = tree;
  });

  return tree;
}

/**
 * Retrieves CSS and JS files from tree of scripts in a flattened order.
 *
 * This is recursive.
 *
 * @method getTreeResources
 * @param {Object} node The node from where to start
 * @param {String} node.path The file path
 * @param {Array} node.styles The list of css / scss file paths
 * @return {Object} An object with:
 *   - **childrenCss** The list of children CSS files
 *   - **childrenJs** The list of children CSS files
 *   - **subChildrenCss** The list of sub children CSS files
 *   - **subChildrenJs** The list of sub children JS files
 * @private
 */
function getTreeResources(node) {
  var resources = {childrenCss: [], childrenJs: [], subChildrenCss: [], subChildrenJs: []};

  // Add css and js of node children then dedupe
  if (node.children) {
    node.children.forEach(function(subNode) {
      var subResources = getTreeResources(subNode);
      resources.childrenJs = utilApi.joinArray(resources.childrenJs, [subNode.path]);
      resources.childrenCss = utilApi.joinArray(resources.childrenCss, subNode.styles);
      resources.subChildrenCss = utilApi.joinArray(resources.subChildrenCss, subResources.childrenCss);
      resources.subChildrenJs = utilApi.joinArray(resources.subChildrenJs, subResources.childrenJs);
      resources.subChildrenCss = utilApi.joinArray(resources.subChildrenCss, subResources.subChildrenCss);
      resources.subChildrenJs = utilApi.joinArray(resources.subChildrenJs, subResources.subChildrenJs);
    });
  } else {

    // Add current node css and js then dedupe
    resources.childrenCss = utilApi.joinArray(resources.childrenCss, node.styles);
    resources.childrenJs = utilApi.joinArray(resources.childrenJs, [node.path]);

  }

  return resources;
}

/**
 * Retrieves CSS and JS files from tree of scripts in a flattened order.
 *
 * @method getResources
 * @param {Object} tree The tree of resources
 * @return {Object} An object with:
 *   - **css** The list of css files in the right order
 *   - **js** The list of js files in the right order
 * the list of JS files
 * @private
 */
function getResources(tree) {
  var resources = getTreeResources(tree);
  return {
    css: utilApi.joinArray(resources.childrenCss, resources.subChildrenCss),
    js: utilApi.joinArray(resources.childrenJs, resources.subChildrenJs)
  };
}

/**
 * Defines a grunt task to build the list of sources (css and js) of an AngularJS application.
 *
 * AngularJS applications, which respect components architecture, need to be loaded in the right order as some
 * components may depend on other components. This task helps build an array of JavaScript files and css / scss files
 * in the right order.
 *
 * For this to work, each module must be declared in a separated file and a single file should not define AngularJS
 * elements belonging to several different modules.
 *
 * Available options are:
 *   - basePath: The base path which will be replaced by the cssPrefix or jsPrefix
 *   - cssPrefix: For CSS / SCSS files, replace the basePath by this prefix
 *   - jsPrefix: For JS files, replace the basePath by this prefix
 *
 *     // Register task
 *     var openVeoApi = require('@openveo/api');
 *     grunt.registerMultiTask('ngDp', openVeoApi.grunt.ngDpTask(grunt));
 *
 *     // Configure task
 *     grunt.initConfig({
 *       'ngDp': {
 *         options: {
 *           basePath: '/path/to/the/',
 *           cssPrefix: '../../other/css/path/',
 *           jsPrefix: '../../other/js/path/'
 *         },
 *         app1: {
 *           src: '/path/to/the/app1/**\/*.*',
 *           dest: '/path/to/the/app1/topology.json'
 *         },
 *         app2: {
 *           src: '/path/to/the/app2**\/*.*',
 *           dest: '/path/to/the/app2/topology.json'
 *         }
 *       }
 *     });
 *
 *     // Ouput example (/path/to/the/app1/topology.json)
 *     {
 *       js: ['../..other/js/path/app1/file1.js', '../..other/js/path/app1/file2.js', [...]],
 *       css: ['../..other/css/path/app1/file1.css', '../..other/css/path/app1/file2.css', [...]]
 *     }
 *
 * @class ngDpTask
 * @static
 */
module.exports = function(grunt) {
  return function() {
    var done = this.async();
    var asyncFunctions = [];
    var options = this.options({
      basePath: '',
      cssPrefix: '',
      jsPrefix: ''
    });

    /**
     * Generates a file with the list of JS and CSS files in the right order.
     *
     * @param {Array} sourceFiles The list of grunt source files
     * @param {String} destination The destination file which will contain the list of JS files and CSS files
     * @param {Function} callback The function to call when it's done with:
     *   - **Error** If an error occurred, null otherwise
     */
    var generateSourcesFile = function(sourceFiles, destination, callback) {
      var readAsyncFunctions = [];
      var sources = [];
      var scripts = [];
      var styles = [];

      sourceFiles.forEach(function(sourceFile) {
        readAsyncFunctions.push(function(callback) {
          grunt.verbose.writeln('read file ' + sourceFile);

          fs.stat(sourceFile, function(error, fileStat) {
            if (fileStat) {
              fileStat.path = sourceFile;
              sources = sources.concat(fileStat);
            }
            callback(error);
          });
        });
      });

      // Get stats for all source files
      async.parallel(readAsyncFunctions, function(error, results) {
        if (error) return callback(error);
        var analyzeAsyncFunctions = [];

        // Analyze all source files and distinguish JS and CSS files
        sources.forEach(function(source) {
          if (source.isFile()) {
            var pathDescriptor = path.parse(source.path);

            if (pathDescriptor.ext === '.js') {

              // JavaScript files
              analyzeAsyncFunctions.push(function(callback) {
                fs.readFile(source.path, function(error, content) {
                  grunt.verbose.writeln('analyze ' + source.path);
                  var contentString = content.toString();

                  // Try to find parents of the source
                  var programExpressions = esprima.parseScript(contentString);
                  var script = findDependencies(programExpressions);
                  script.path = source.path.replace(options.basePath, options.jsPrefix);
                  script.styles = [];
                  scripts.push(script);
                  callback(error);
                });
              });
            } else if (pathDescriptor.ext === '.css' ||
                       pathDescriptor.ext === '.scss'
            ) {

              // CSS / SCSS files
              styles.push(source.path.replace(options.basePath, options.cssPrefix));

            }
          }
        });

        async.parallel(analyzeAsyncFunctions, function(error) {
          if (error) return callback(error);

          // Associate css files with scripts
          styles.forEach(function(style) {
            for (var i = 0; i < scripts.length; i++) {
              var originalScriptPath = scripts[i].path.replace(options.jsPrefix, '');
              var originalStylePath = style.replace(options.cssPrefix, '');
              if (path.dirname(originalScriptPath) === path.dirname(originalStylePath)) {
                scripts[i].styles.push(style);
                return;
              }
            }
          });

          // Create final file
          grunt.file.write(destination, JSON.stringify(getResources(buildTree(scripts))));
          grunt.log.oklns('Ordered styles and scripts have been saved in ' + destination);

          callback();
        });
      });
    };

    // Iterates through src-dest pairs
    this.files.forEach(function(srcDestFile) {
      asyncFunctions.push(function(callback) {
        generateSourcesFile(srcDestFile.src, srcDestFile.dest, callback);
      });
    });

    async.series(asyncFunctions, function(error) {
      if (error)
        grunt.fail.fatal(error);

      done();
    });
  };
};
