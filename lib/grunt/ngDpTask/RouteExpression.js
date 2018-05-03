'use strict';

/**
 * @module grunt
 */

var util = require('util');
var Expression = process.requireApi('lib/grunt/ngDpTask/Expression.js');

/**
 * An AngularJS ngRoute JavaScript route expression.
 *
 * AngularJS route expressions uses when:
 * <pre>$routeProvider.when('/path', {
 *   resolve: {
 *     definition1: ['Dependency1', function() {}],
 *     definition2: ['Dependency2', function() {}],
 *   }
 * });</pre>
 *
 * @class RouteExpression
 * @constructor
 * @param {Object} expression The route expression as returned by esprima
 */
function RouteExpression(expression) {
  RouteExpression.super_.call(this, expression);
}

module.exports = RouteExpression;
util.inherits(RouteExpression, Expression);

/**
 * Gets AngularJS route expression dependencies.
 *
 * The following dependency expressions are supported:
 *   - The attribute "controller" of the route
 *   - All dependencies injected in "resolve" properties
 *
 * @method getDependencies
 * @return {Array} The list of dependencies
 */
RouteExpression.prototype.getDependencies = function() {
  var dependencies = [];

  this.expression.arguments[1].properties.forEach(function(property) {
    if (property.key.name === 'resolve' && property.value.type === 'ObjectExpression') {
      property.value.properties.forEach(function(resolveProperty) {
        if (resolveProperty.value.type === 'ArrayExpression') {
          resolveProperty.value.elements.forEach(function(dependency) {
            if (dependency.type === 'Literal' && dependencies.indexOf(dependency.value) === -1)
              dependencies.push(dependency.value);
          });
        }
      });
    } else if (property.key.name === 'controller' && property.value.type === 'Literal') {
      dependencies.push(property.value.value);
    }
  });

  return dependencies;
};

/**
 * Gets AngularJS route definitions.
 *
 * The following definition expressions are supported:
 *   - All "resolve" property keys
 *
 * @method getDefinitions
 * @return {Array} The list of definitions
 */
RouteExpression.prototype.getDefinitions = function() {
  var definitions = [];

  this.expression.arguments[1].properties.forEach(function(property) {
    if (property.key.name === 'resolve' && property.value.type === 'ObjectExpression') {
      property.value.properties.forEach(function(resolveProperty) {
        definitions.push(resolveProperty.key.name);
      });
    }
  });

  return definitions;
};

/**
 * Validates that the expression is a route expression.
 *
 * An AngularJS route definition expression must have two arguments:
 *   - The path of the route
 *   - The route description object
 *
 * @method isValid
 * @return {Boolean} true if this is a valid route expression
 */
RouteExpression.prototype.isValid = function() {
  return (this.expression.arguments.length === 2 &&
          this.expression.arguments[0].type === 'Literal' &&
          this.expression.arguments[1].type === 'ObjectExpression');
};
