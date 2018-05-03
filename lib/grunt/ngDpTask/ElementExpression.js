'use strict';

/**
 * @module grunt
 */

var util = require('util');
var Expression = process.requireApi('lib/grunt/ngDpTask/Expression.js');

/**
 * An AngularJS JavaScript element expression.
 *
 * See Expression.ELEMENTS for supported AngularJS element expressions.
 * AngularJS JavaScript element expressions could be:
 *   - angular.module('moduleName').component()
 *   - angular.module('moduleName').directive()
 *   - angular.module('moduleName').controller()
 *   - angular.module('moduleName').factory()
 *   - angular.module('moduleName').service()
 *   - angular.module('moduleName').constant()
 *   - angular.module('moduleName').service()
 *   - angular.module('moduleName').decorator()
 *   - angular.module('moduleName').filter()
 *   - angular.module('moduleName', [])
 *
 * @class ElementExpression
 * @constructor
 * @param {Object} expression The call expression as returned by esprima
 */
function ElementExpression(expression) {
  ElementExpression.super_.call(this, expression);
}

module.exports = ElementExpression;
util.inherits(ElementExpression, Expression);

/**
 * The list of supported AngularJS call expressions.
 *
 * @property ELEMENTS
 * @type Array
 * @final
 */
ElementExpression.ELEMENTS = {
  COMPONENT: 'component',
  DIRECTIVE: 'directive',
  CONTROLLER: 'controller',
  FACTORY: 'factory',
  SERVICE: 'service',
  CONSTANT: 'constant',
  DECORATOR: 'decorator',
  FILTER: 'filter',
  MODULE: 'module',
  PROVIDER: 'provider',
  VALUE: 'value'
};

Object.freeze(ElementExpression.ELEMENTS);

/**
 * Gets the expression type.
 *
 * @method getElementType
 * @return {String} The expression type as defined in Expression.ELEMENTS
 */
ElementExpression.prototype.getElementType = function() {
  return this.expression.callee.property.name;
};

/**
 * Gets the name of the AngularJS element defined by this expression.
 *
 * @method getName
 * @return {String} The name of the AngularJS element
 */
ElementExpression.prototype.getName = function() {
  return this.expression.arguments[0].value;
};

/**
 * Validates that the expression is an AngularJS definition expression.
 *
 * An AngularJS element definition expression must have two arguments:
 *   - The name of the element to define
 *   - A function or an array (when including dependencies)
 *
 * @method isValid
 * @return {Boolean} true if this is a valid AngularJS element expression, false otherwise
 */
ElementExpression.prototype.isValid = function() {
  return (this.expression.arguments[0].type === 'Literal' &&
     this.expression.arguments.length === 2 &&
     (this.expression.arguments[1].type === 'Identifier' ||
     this.expression.arguments[1].type === 'ArrayExpression' ||
     this.expression.arguments[1].type === 'FunctionExpression')
  );
};

/**
 * Checks if the expression is an AngularJS definition.
 *
 * @method isDefinition
 * @return {Boolean} true
 */
ElementExpression.prototype.isDefinition = function() {
  return true;
};

/**
 * Gets AngularJS element dependencies.
 *
 * The following dependency expressions are supported:
 *   - Dependencies injected using AngularJS strict dependency injection syntax
 *
 * @method getDependencies
 * @return {Array} The list of dependencies
 */
ElementExpression.prototype.getDependencies = function() {
  var dependencies = [];

  if (this.expression.arguments[1].type === 'ArrayExpression') {
    this.expression.arguments[1].elements.forEach(function(dependency) {
      if (dependency.type === 'Literal')
        dependencies.push(dependency.value);
    });
  }

  return dependencies;
};
