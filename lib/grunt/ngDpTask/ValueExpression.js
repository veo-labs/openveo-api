'use strict';

var util = require('util');
var ElementExpression = process.requireApi('lib/grunt/ngDpTask/ElementExpression.js');

/**
 * A JavaScript value expression as angularJsApp.value().
 *
 * @class ValueExpression
 * @constructor
 * @param {Object} expression The value call expression as returned by esprima
 */
function ValueExpression(expression) {
  ValueExpression.super_.call(this, expression);
}

module.exports = ValueExpression;
util.inherits(ValueExpression, ElementExpression);

/**
 * Validates that the expression is an AngularJS value definition expression.
 *
 * An AngularJS value definition expression must have two arguments:
 *   - The name of the value to define
 *   - Could be anything
 *
 * @method isValid
 * @return {Boolean} true if this is a valid AngularJS value expression, false otherwise
 */
ValueExpression.prototype.isValid = function() {
  return (this.expression.arguments[0].type === 'Literal' && this.expression.arguments.length === 2);
};
