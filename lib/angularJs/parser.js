'use strict';

/**
 * @module angularJs/parser
 */

var fs = require('fs');
var path = require('path');

var async = require('async');
var esprima = require('esprima');
var htmlMinifier = require('html-minifier-terser');

var ConfigExpression = process.requireApi('lib/angularJs/expressions/ConfigExpression.js');
var ElementExpression = process.requireApi('lib/angularJs/expressions/ElementExpression.js');
var expressionFactory = process.requireApi('lib/angularJs/expressions/expressionFactory.js');
var FilterExpression = process.requireApi('lib/angularJs/expressions/FilterExpression.js');
var InjectExpression = process.requireApi('lib/angularJs/expressions/InjectExpression.js');
var RouteExpression = process.requireApi('lib/angularJs/expressions/RouteExpression.js');
var fileSystem = process.requireApi('lib/fileSystem.js');
var utilApi = process.requireApi('lib/util.js');

/**
 * Fetches a script from a list of scripts.
 *
 * @method findScript
 * @param {Array} scripts The list of scripts
 * @param {String} property The script property used to identify the script to fetch
 * @param {String} value The expected value of the script property
 * @return {(Object|null)} The found script or null if not found
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
 * @param {Array} scripts[].dependencies The list of dependency names of the script
 * @param {Array} scripts[].definitions The list of definition names of the script
 * @param {String} scripts[].path The script path
 * @param {Object} [script] The script to analyze (default to the first one of the list of scripts)
 * @param {Array} [modulesToIgnore] The list of module names to ignore to avoid circular dependencies
 * @return {Array} The longest dependency chains
 * @private
 */
function findLongestDependencyChains(scripts, script, modulesToIgnore) {
  var chains = [];

  if (!script) script = scripts[0];

  // Avoid circular dependencies
  if (modulesToIgnore && script.module && modulesToIgnore.indexOf(script.module) !== -1) return chains;

  // Get script dependencies
  if (script.dependencies && script.dependencies.length) {
    var longestChainLength;

    // Find dependency chains of the script
    script.dependencies.forEach(function(dependency) {
      var definitionScript = findScript(scripts, 'definitions', dependency);

      if (definitionScript)
        chains = chains.concat(findLongestDependencyChains(scripts, definitionScript, script.definitions));
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
 * Retrieves CSS and JS files from tree of scripts in a flattened order.
 *
 * This is recursive.
 *
 * @method getTreeResources
 * @param {Object} node The node from where to start
 * @param {String} node.path The file path
 * @param {Array} node.styles The list of css / scss file paths
 * @return {module:angularJs/parser~getTreeResourcesReturnValue} The list of files by types
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
 * Builds the dependencies tree.
 *
 * @method buildTree
 * @static
 * @param {Array} scripts The flat list of scripts with for each script:
 * @param {Array} dependencies The list of dependency names of the script
 * @param {Array} definitions The list of definition names of the script
 * @param {String} path The script path
 * @return {Array} The list of scripts with their dependencies
 */
module.exports.buildTree = function(scripts) {
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
};

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
 * @static
 * @param {Object} expression The JavaScript expression to analyze
 */
module.exports.findDependencies = function(jsExpression) {
  var self = this;
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
      mergeResults(self.findDependencies(jsExpression[property]));
  } else if (Object.prototype.toString.call(jsExpression) === '[object Array]') {
    jsExpression.forEach(function(value) {
      mergeResults(self.findDependencies(value));
    });
  }

  return results;
};

/**
 * Generates an AngularJS file with all given templates directly loaded into $templateCache.
 *
 * @method generateTemplatesCache
 * @static
 * @param {Array} templatesPath The list of templates files paths to add to cache
 * @param {String} outputPath The path of the resulting AngularJS file
 * @param {String} moduleName The AngularJS module to use to load templates into $templateCache
 * @param {String} [prefix] A prefix to apply to each template name
 * @param {callback} callback Function to call when its done
 */
module.exports.generateTemplatesCache = function(templatesPaths, outputPath, moduleName, prefix, callback) {
  if (!moduleName) return callback(new TypeError('moduleName should be a string'));
  var script = '  \'use strict\';\n';

  var minifyFunctions = [];
  var minify = function(templatePath) {
    return function(callback) {
      fs.readFile(templatePath, function(readError, templateContent) {
        if (readError) return callback(readError);
        var minified = false;
        htmlMinifier.minify(templateContent.toString(), {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        }).then(function(minifiedTemplate) {
          minified = true;
          var parsedPath = path.parse(templatePath);
          callback(null, {
            name: (prefix ? prefix : '') + parsedPath.name + parsedPath.ext,
            template: minifiedTemplate
          });
        }).catch(function(minifyError) {
          if (!minified) callback(minifyError);
        });
      });
    };
  };
  var escapeTemplate = function(template) {
    return template.split(/^/gm).map(function(line) {
      var quote = '\'';

      line = line.replace(/\\/g, '\\\\');
      line = line.replace(/\n/g, '\\n');
      line = line.replace(/\r/g, '\\r');
      var quoteRegExp = new RegExp(quote, 'g');
      line = line.replace(quoteRegExp, '\\' + quote);

      return quote + line + quote;
    }).join(' +\n    ') || '""';
  };

  for (var templatePath of templatesPaths) {
    minifyFunctions.push(minify(templatePath));
  }

  async.parallel(minifyFunctions, function(error, minifiedTemplates) {
    if (error) return callback(error);

    for (var minifiedTemplate of minifiedTemplates) {
      script += '\n  $templateCache.put(\'' + minifiedTemplate.name + '\',\n    ' +
        escapeTemplate(minifiedTemplate.template) +
        '\n  );\n';
    }

    fileSystem.mkdir(path.dirname(outputPath), function(mkdirError) {
      if (mkdirError) return callback(mkdirError);

      fs.writeFile(
        outputPath,
        'angular.module(\'' + moduleName + '\')' +
        '.run([\'$templateCache\', function($templateCache) {\n' +
        script +
        '\n}]);\n',
        callback
      );
    });

  });
};

/**
 * Retrieves CSS and JS files from tree of scripts in a flattened order.
 *
 * @method getResources
 * @static
 * @param {Object} tree The tree of resources
 * @return {module:angularJs/parser~getResourcesReturnValue} The list of files by types
 */
module.exports.getResources = function(tree) {
  var resources = getTreeResources(tree);
  return {
    css: utilApi.joinArray(resources.childrenCss, resources.subChildrenCss),
    js: utilApi.joinArray(resources.childrenJs, resources.subChildrenJs)
  };
};

/**
 * Orders a list of components JavaScript and SCSS files.
 *
 * JavaScript and SCSS files are ordered in the way they should be laoded.
 *
 * @param {Array} sourcesFilesPaths The list of JavaScript and SCSS sources to order
 * @return {module:angularJs/parser~orderSourcesCallback} Function to call when its done
 */
module.exports.orderSources = function(sourcesFilesPaths, callback) {
  var self = this;
  var analyzeAsyncFunctions = [];
  var scripts = [];
  var styles = [];

  sourcesFilesPaths.forEach(function(sourceFilePath) {
    var pathDescriptor = path.parse(sourceFilePath);

    if (pathDescriptor.ext === '.js') {

      // JavaScript files
      analyzeAsyncFunctions.push(function(callback) {
        fs.readFile(sourceFilePath, function(error, content) {
          var contentString = content.toString();

          // Try to find parents of the source
          var programExpressions = esprima.parseScript(contentString);
          var script = self.findDependencies(programExpressions);
          script.path = sourceFilePath;
          script.styles = [];
          scripts.push(script);
          callback(error);
        });
      });
    } else if (pathDescriptor.ext === '.css' ||
               pathDescriptor.ext === '.scss'
    ) {

      // CSS / SCSS files
      styles.push(sourceFilePath);

    }
  });

  async.parallel(analyzeAsyncFunctions, function(error) {
    if (error) return callback(error);

    // Associate css files with scripts
    styles.forEach(function(style) {
      for (var i = 0; i < scripts.length; i++) {
        var originalScriptPath = scripts[i].path;
        var originalStylePath = style;
        if (path.dirname(originalScriptPath) === path.dirname(originalStylePath)) {
          scripts[i].styles.push(style);
          return;
        }
      }
    });

    callback(null, self.getResources(self.buildTree(scripts)));
  });
};

/**
 * @typedef {Object} module:angularJs/parser~getTreeResourcesReturnValue
 * @property {Array} childrenCss The list of children CSS files
 * @property {Array} childrenJs The list of children CSS files
 * @property {Array} subChildrenCss The list of sub children CSS files
 * @property {Array} subChildrenJs The list of sub children JS files
 */

/**
 * @typedef {Object} module:angularJs/parser~getResourcesReturnValue
 * @property {Array} css The list of css files in the right order
 * @property {Array} js The list of js files in the right order
 */

/**
 * @typedef {Object} module:angularJs/parser~orderSourcesCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Object|Undefined)} sources JavaScript and SCSS sources
 * @param {Array} sources.js JavaScript sources
 * @param {Array} sources.css SCSS sources
 */
