'use strict';

var util = require('util');
var Expression = process.requireApi('lib/grunt/ngDpTask/Expression.js');

/**
 * An AngularJS JavaScript $filter expression.
 *
 * Filters can be injected using AngularJS $filter service:
 * $filter('filterName');
 *
 * @class FilterExpression
 * @constructor
 * @param {Object} expression The $filter expression as returned by esprima
 */
function FilterExpression(expression) {
  FilterExpression.super_.call(this, expression);
}

module.exports = FilterExpression;
util.inherits(FilterExpression, Expression);

/**
 * Gets AngularJS $filter dependency.
 *
 * @method getDependency
 * @return {String} The name of the injected filter
 */
FilterExpression.prototype.getDependency = function() {
  return this.expression.arguments[0].value;
};

/**
 * Validates that the expression is a valid $filter expression.
 *
 * An AngularJS $filter expression must have one argument:
 *   - The name of the filter to inject
 *
 * @method isValid
 * @return {Boolean} true if this is a valid $filter expression
 */
FilterExpression.prototype.isValid = function() {
  return (this.expression.arguments.length === 1 && this.expression.arguments[0].type === 'Literal');
};
