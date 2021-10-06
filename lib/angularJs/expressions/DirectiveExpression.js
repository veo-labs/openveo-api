'use strict';

/**
 * @module angularJs/expressions/DirectiveExpression
 * @ignore
 */

var util = require('util');
var ElementExpression = process.requireApi('lib/angularJs/expressions/ElementExpression.js');

/**
 * A JavaScript directive expression as angularJsApp.directive().
 *
 * @class DirectiveExpression
 * @constructor
 * @ignore
 * @param {Object} expression The directive call expression as returned by esprima
 */
function DirectiveExpression(expression) {
  DirectiveExpression.super_.call(this, expression);
}

module.exports = DirectiveExpression;
util.inherits(DirectiveExpression, ElementExpression);

/**
 * Gets AngularJS directive dependencies.
 *
 * The following dependency expressions are supported:
 *   - The attribute "controller" of the directive definition
 *
 * @return {Array} The list of dependencies
 */
DirectiveExpression.prototype.getDependencies = function() {
  var dependencies = [];

  // AngularJS directives may use the "require" or "controller" options with dependency injection
  if (this.expression.arguments[1].type === 'FunctionExpression') {
    this.expression.arguments[1].body.body[0].argument.properties.forEach(function(property) {
      if (property.key.name === 'controller' && property.value.type === 'Literal')
        dependencies.push(property.value.value);
    });
  }

  return dependencies;
};
