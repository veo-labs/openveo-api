'use strict';

/**
 * @module grunt
 */

var util = require('util');
var ElementExpression = process.requireApi('lib/grunt/ngDpTask/ElementExpression.js');

/**
 * A JavaScript module expression as angularJsApp.module('module').
 *
 * @class ModuleExpression
 * @constructor
 * @param {Object} expression The module call expression as returned by esprima
 */
function ModuleExpression(expression) {
  ModuleExpression.super_.call(this, expression);
}

module.exports = ModuleExpression;
util.inherits(ModuleExpression, ElementExpression);

/**
 * Validates that the expression is an AngularJS module definition expression.
 *
 * An AngularJS module definition expression must have two arguments:
 *   - The name of the element to define
 *   - An array of dependencies
 *
 * @method isValid
 * @return {Boolean} true if this is a valid AngularJS module definition expression, false otherwise
 */
ModuleExpression.prototype.isValid = function() {
  return (this.expression.arguments[0].type === 'Literal' &&
    (this.expression.arguments.length === 1 ||
    (this.expression.arguments.length === 2 && this.expression.arguments[1].type === 'ArrayExpression'))
  );
};

/**
 * Gets AngularJS module dependencies.
 *
 * @method getDependencies
 * @return {Array} The list of dependencies
 */
ModuleExpression.prototype.getDependencies = function() {
  var dependencies = [];

  if (this.isDefinition()) {
    this.expression.arguments[1].elements.forEach(function(dependency) {
      if (dependency.type === 'Literal')
        dependencies.push(dependency.value);
    });
  } else
    dependencies.push(this.getName());

  return dependencies;
};

/**
 * Checks if the module expression is an AngularJS definition.
 *
 * angular.module() may be used to retrieve a previously registered module or to define a new one.
 *
 * @method isDefinition
 * @return {Boolean} true if this is a module definition, false otherwise
 */
ModuleExpression.prototype.isDefinition = function() {
  return (this.expression.arguments.length === 2);
};
