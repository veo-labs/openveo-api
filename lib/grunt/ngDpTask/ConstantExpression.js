'use strict';

var util = require('util');
var ValueExpression = process.requireApi('lib/grunt/ngDpTask/ValueExpression.js');

/**
 * A JavaScript constant expression as angularJsApp.constant().
 *
 * @class ConstantExpression
 * @constructor
 * @param {Object} expression The constant call expression as returned by esprima
 */
function ConstantExpression(expression) {
  ConstantExpression.super_.call(this, expression);
}

module.exports = ConstantExpression;
util.inherits(ConstantExpression, ValueExpression);
