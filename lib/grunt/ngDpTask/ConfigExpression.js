'use strict';

var util = require('util');
var Expression = process.requireApi('lib/grunt/ngDpTask/Expression.js');

/**
 * An AngularJS JavaScript config expression.
 *
 * AngularJS config expressions uses angular.module.config():
 * angular.module('AngularJsModule').config(['Dependency1', function(Dependency1) {});
 *
 * @class ConfigExpression
 * @constructor
 * @param {Object} expression The config expression as returned by esprima
 */
function ConfigExpression(expression) {
  ConfigExpression.super_.call(this, expression);
}

module.exports = ConfigExpression;
util.inherits(ConfigExpression, Expression);

/**
 * Gets AngularJS config dependencies.
 *
 * Only dependencies in strict dependency injection are supported.
 *
 * @method getDependencies
 * @return {Array} The list of dependencies
 */
ConfigExpression.prototype.getDependencies = function() {
  var dependencies = [];

  if (this.expression.arguments[0].type === 'ArrayExpression') {
    this.expression.arguments[0].elements.forEach(function(dependency) {
      if (dependency.type === 'Literal')
        dependencies.push(dependency.value);
    });
  }

  return dependencies;
};

/**
 * Validates that the expression is a config expression.
 *
 * An AngularJS config expression must have one argument:
 *   - Either an array when using strict dependency injection or just a function
 *
 * @method isValid
 * @return {Boolean} true if this is a valid config expression
 */
ConfigExpression.prototype.isValid = function() {
  return (this.expression.arguments.length === 1 &&
          (this.expression.arguments[0].type === 'ArrayExpression' ||
           this.expression.arguments[0].type === 'FunctionExpression' ||
           this.expression.arguments[0].type === 'Identifier'));
};
