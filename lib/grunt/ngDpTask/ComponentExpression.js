'use strict';

/**
 * @module grunt
 */

var util = require('util');
var ElementExpression = process.requireApi('lib/grunt/ngDpTask/ElementExpression.js');

/**
 * A JavaScript component expression as angularJsApp.component().
 *
 * @class ComponentExpression
 * @constructor
 * @param {Object} expression The component call expression as returned by esprima
 */
function ComponentExpression(expression) {
  ComponentExpression.super_.call(this, expression);
}

module.exports = ComponentExpression;
util.inherits(ComponentExpression, ElementExpression);

/**
 * Validates that the expression is an AngularJS component definition expression.
 *
 * An AngularJS component definition expression must have two arguments:
 *   - The name of the component to define
 *   - The description object of the component
 *
 * @method isValid
 * @return {Boolean} true if this is a valid AngularJS component definition expression, false otherwise
 */
ComponentExpression.prototype.isValid = function() {
  return (this.expression.arguments[0].type === 'Literal' &&
     this.expression.arguments.length === 2 &&
     this.expression.arguments[1].type === 'ObjectExpression'
  );
};

/**
 * Gets AngularJS component dependencies.
 *
 * The following dependency expressions are supported:
 *   - The attribute "controller" of the component definition
 *
 * @method getDependencies
 * @return {Array} The list of dependencies
 */
ComponentExpression.prototype.getDependencies = function() {
  var dependencies = [];

  // AngularJS components may use the "require" or "controller" options with dependency injection
  if (this.expression.arguments[1].type === 'ObjectExpression') {
    this.expression.arguments[1].properties.forEach(function(property) {
      if (property.key.name === 'controller' && property.value.type === 'Literal')
        dependencies.push(property.value.value);
    });
  }

  return dependencies;
};
