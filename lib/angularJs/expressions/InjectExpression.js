'use strict';

/**
 * @module angularJs/expressions/InjectExpression
 * @ignore
 */

var util = require('util');
var Expression = process.requireApi('lib/angularJs/expressions/Expression.js');

/**
 * An AngularJS JavaScript inject assignement expression.
 *
 * AngularJS inject assignement expressions uses $inject:
 * AngularJsElement.$inject = ['$scope'];
 *
 * @class InjectExpression
 * @constructor
 * @ignore
 * @param {Object} expression The inject assignement expression as returned by esprima
 */
function InjectExpression(expression) {
  InjectExpression.super_.call(this, expression);
}

module.exports = InjectExpression;
util.inherits(InjectExpression, Expression);

/**
 * Gets inject expression dependencies.
 *
 * @return {Array} The list of dependencies
 */
InjectExpression.prototype.getDependencies = function() {
  var dependencies = [];

  this.expression.right.elements.forEach(function(dependency) {
    if (dependency.type === 'Literal')
      dependencies.push(dependency.value);
  });

  return dependencies;
};

/**
 * Validates that the expression is a $inject expression.
 *
 * An AngularJS $inject expression must have an array as the right assignement token.
 *
 * @return {Boolean} true if this is a valid $inject expression
 */
InjectExpression.prototype.isValid = function() {
  return (this.expression.right.type === 'ArrayExpression');
};
