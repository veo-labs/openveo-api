'use strict';

/**
 * @module angularJs/expressions/expressionFactory
 * @ignore
 */

var ElementExpression = process.requireApi('lib/angularJs/expressions/ElementExpression.js');
var ComponentExpression = process.requireApi('lib/angularJs/expressions/ComponentExpression.js');
var DirectiveExpression = process.requireApi('lib/angularJs/expressions/DirectiveExpression.js');
var ModuleExpression = process.requireApi('lib/angularJs/expressions/ModuleExpression.js');
var ValueExpression = process.requireApi('lib/angularJs/expressions/ValueExpression.js');
var ConstantExpression = process.requireApi('lib/angularJs/expressions/ConstantExpression.js');

/**
 * Gets an instance of an Expression.
 *
 * @method get
 * @static
 * @ignore
 * @param {String} name The AngularJS element name (see Expression.ELEMENTS)
 * @param {Object} expression The definition expression as returned by esprima
 * @return {Expression} The definition expression
 * @throws {TypeError} If expression type is unknown
 */
module.exports.getElementExpression = function(name, expression) {
  if (name && expression) {
    switch (name) {

      case ElementExpression.ELEMENTS.COMPONENT:
        return new ComponentExpression(expression);

      case ElementExpression.ELEMENTS.MODULE:
        return new ModuleExpression(expression);

      case ElementExpression.ELEMENTS.DIRECTIVE:
        return new DirectiveExpression(expression);

      case ElementExpression.ELEMENTS.VALUE:
        return new ValueExpression(expression);

      case ElementExpression.ELEMENTS.CONSTANT:
        return new ConstantExpression(expression);

      default:
        if (Object.values(ElementExpression.ELEMENTS).indexOf(name) > -1)
          return new ElementExpression(expression);
        else
          throw new TypeError('Unknown definition expression type "' + name + '"');
    }
  } else
    throw new TypeError('Invalid expression definition');
};
