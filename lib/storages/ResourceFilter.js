'use strict';

/**
 * @module storages
 */

/**
 * Defines a storage filter.
 *
 * A filter is a uniform way of filtering results common to all storages.
 * A filter can contain only one "or" operation, one "nor" operation and one "and" operation.
 *
 *     var filter = new ResourceFilter()
 *     .equal('field1', 42)
 *     .notEqual('field2', 42)
 *     .greaterThan('field3', 42)
 *     .greaterThanEqual('field4', 42)
 *     .in('field5', [42])
 *     .lesserThan('field6', 42)
 *     .lesserThanEqual('field7', 42)
 *     .regex('field8', /^Something/i)
 *     .search('query')
 *     .or([
 *       new ResourceFilter().equal('field8', 42),
 *       new ResourceFilter().notIn('field9', [42])
 *     ])
 *     .nor([
 *       new ResourceFilter().equal('field10', 42),
 *       new ResourceFilter().notIn('field11', [42])
 *     )],
 *     .and([
 *       new ResourceFilter().equal('field12', 42),
 *       new ResourceFilter().notIn('field13', [42])
 *     )];
 *
 * @class ResourceFilter
 * @constructor
 */
function ResourceFilter() {
  Object.defineProperties(this, {

    /**
     * The list of operations.
     *
     * @property operations
     * @type Array
     * @final
     */
    operations: {
      value: []
    }

  });

}

module.exports = ResourceFilter;

/**
 * The available operators.
 *
 * @property OPERATORS
 * @type Object
 * @final
 * @static
 */
ResourceFilter.OPERATORS = {
  OR: 'or',
  NOR: 'nor',
  AND: 'and',
  EQUAL: 'equal',
  NOT_EQUAL: 'notEqual',
  IN: 'in',
  NOT_IN: 'notIn',
  GREATER_THAN: 'greaterThan',
  GREATER_THAN_EQUAL: 'greaterThanEqual',
  LESSER_THAN: 'lesserThan',
  LESSER_THAN_EQUAL: 'lesserThanEqual',
  REGEX: 'regex',
  SEARCH: 'search'
};
Object.freeze(ResourceFilter.OPERATORS);

/**
 * Validates the type of a value.
 *
 * @method isValidType
 * @private
 * @param {String} value The value to test
 * @param {Array} The list of authorized types as strings
 * @return {Boolean} true if valid, false otherwise
 */
function isValidType(value, authorizedTypes) {
  var valueToString = Object.prototype.toString.call(value);

  for (var i = 0; i < authorizedTypes.length; i++)
    if (valueToString === '[object ' + authorizedTypes[i] + ']') return true;

  return false;
}

/**
 * Adds a comparison operation to the filter.
 *
 * @method addComparisonOperation
 * @private
 * @param {String} field The name of the field
 * @param {String|Number|Boolean|Date} value The value to compare the field to
 * @param {String} Resource filter operator
 * @param {Array} The list of authorized types as strings
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if field and / or value is not valid
 */
function addComparisonOperation(field, value, operator, authorizedTypes) {
  if (!isValidType(field, ['String'])) throw new TypeError('Invalid field');
  if (!isValidType(value, authorizedTypes)) throw new TypeError('Invalid value');

  this.operations.push({
    type: operator,
    field: field,
    value: value
  });
  return this;
}

/**
 * Adds a logical operation to the filter.
 *
 * Only one logical operation can be added in a filter.
 *
 * @method addLogicalOperation
 * @private
 * @param {Array} filters The list of filters
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if field and / or value is not valid
 */
function addLogicalOperation(filters, operator) {
  for (var i = 0; i < filters.length; i++)
    if (!(filters[i] instanceof ResourceFilter)) throw new TypeError('Invalid filters');

  if (this.hasOperation(operator)) {

    // This logical operator already exists in the list of operations
    // Just add the new filters to the operator

    for (var operation of this.operations) {
      if (operation.type === operator)
        operation.filters = operation.filters.concat(filters);
    }

  } else {

    // This logical operator does not exist yet in the list of operations

    this.operations.push({
      type: operator,
      filters: filters
    });
  }

  return this;
}

/**
 * Adds an equal operation to the filter.
 *
 * @method equal
 * @param {String} field The name of the field
 * @param {String|Number|Boolean|Date} value The value to compare the field to
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if field and / or value is not valid
 */
ResourceFilter.prototype.equal = function(field, value) {
  return addComparisonOperation.call(
    this,
    field,
    value,
    ResourceFilter.OPERATORS.EQUAL,
    ['String', 'Boolean', 'Date', 'Number']
  );
};

/**
 * Adds a "not equal" operation to the filter.
 *
 * @method equal
 * @param {String} field The name of the field
 * @param {String|Number|Boolean|Date} value The value to compare the field to
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if field and / or value is not valid
 */
ResourceFilter.prototype.notEqual = function(field, value) {
  return addComparisonOperation.call(
    this,
    field,
    value,
    ResourceFilter.OPERATORS.NOT_EQUAL,
    ['String', 'Boolean', 'Date', 'Number']
  );
};

/**
 * Adds a "greater than" operation to the filter.
 *
 * @method greaterThan
 * @param {String} field The name of the field
 * @param {String|Number|Boolean|Date} value The value to compare the field to
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if field and / or value is not valid
 */
ResourceFilter.prototype.greaterThan = function(field, value) {
  return addComparisonOperation.call(
    this,
    field,
    value,
    ResourceFilter.OPERATORS.GREATER_THAN,
    ['String', 'Boolean', 'Date', 'Number']
  );
};

/**
 * Adds a "greater than or equal" operation to the filter.
 *
 * @method greaterThanEqual
 * @param {String} field The name of the field
 * @param {String|Number|Boolean|Date} value The value to compare the field to
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if field and / or value is not valid
 */
ResourceFilter.prototype.greaterThanEqual = function(field, value) {
  return addComparisonOperation.call(
    this,
    field,
    value,
    ResourceFilter.OPERATORS.GREATER_THAN_EQUAL,
    ['String', 'Boolean', 'Date', 'Number']
  );
};

/**
 * Adds a "lesser than" operation to the filter.
 *
 * @method lesserThan
 * @param {String} field The name of the field
 * @param {String|Number|Boolean|Date} value The value to compare the field to
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if field and / or value is not valid
 */
ResourceFilter.prototype.lesserThan = function(field, value) {
  return addComparisonOperation.call(
    this,
    field,
    value,
    ResourceFilter.OPERATORS.LESSER_THAN,
    ['String', 'Boolean', 'Date', 'Number']
  );
};

/**
 * Adds a "lesser than equal" operation to the filter.
 *
 * @method lesserThanEqual
 * @param {String} field The name of the field
 * @param {String|Number|Boolean|Date} value The value to compare the field to
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if field and / or value is not valid
 */
ResourceFilter.prototype.lesserThanEqual = function(field, value) {
  return addComparisonOperation.call(
    this,
    field,
    value,
    ResourceFilter.OPERATORS.LESSER_THAN_EQUAL,
    ['String', 'Boolean', 'Date', 'Number']
  );
};

/**
 * Adds an "in" operation to the filter.
 *
 * @method in
 * @param {String} field The name of the field
 * @param {Array} value The value to compare the field to
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if field and / or value is not valid
 */
ResourceFilter.prototype.in = function(field, value) {
  if (!isValidType(value, ['Array'])) throw new TypeError('Invalid value');

  for (var i = 0; i < value.length; i++)
    if (!isValidType(value[i], ['String', 'Boolean', 'Date', 'Number'])) throw new TypeError('Invalid value');

  return addComparisonOperation.call(this, field, value, ResourceFilter.OPERATORS.IN, ['Array']);
};

/**
 * Adds a "not in" operation to the filter.
 *
 * @method in
 * @param {String} field The name of the field
 * @param {Array} value The value to compare the field to
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if field and / or value is not valid
 */
ResourceFilter.prototype.notIn = function(field, value) {
  if (!isValidType(value, ['Array'])) throw new TypeError('Invalid value');

  for (var i = 0; i < value.length; i++)
    if (!isValidType(value[i], ['String', 'Boolean', 'Date', 'Number'])) throw new TypeError('Invalid value');

  return addComparisonOperation.call(this, field, value, ResourceFilter.OPERATORS.NOT_IN, ['Array']);
};

/**
 * Adds a "regular expression" operation to the filter.
 *
 * @method regex
 * @param {String} field The name of the field
 * @param {RegExp} value The regular expression to compare the field to
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if field and / or value is not valid
 */
ResourceFilter.prototype.regex = function(field, value) {
  return addComparisonOperation.call(
    this,
    field,
    value,
    ResourceFilter.OPERATORS.REGEX,
    ['RegExp']
  );
};

/**
 * Adds a "or" operation to the filter.
 *
 * @method or
 * @param {Array} filters The list of filters
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if filters are not valid
 */
ResourceFilter.prototype.or = function(filters) {
  return addLogicalOperation.call(this, filters, ResourceFilter.OPERATORS.OR);
};

/**
 * Adds a "nor" operation to the filter.
 *
 * @method nor
 * @param {Array} filters The list of filters
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if filters are not valid
 */
ResourceFilter.prototype.nor = function(filters) {
  return addLogicalOperation.call(this, filters, ResourceFilter.OPERATORS.NOR);
};

/**
 * Adds an "and" operation to the filter.
 *
 * @method and
 * @param {Array} filters The list of filters
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if filters are not valid
 */
ResourceFilter.prototype.and = function(filters) {
  return addLogicalOperation.call(this, filters, ResourceFilter.OPERATORS.AND);
};

/**
 * Adds a "search" operation to the filter.
 *
 * @method search
 * @param {String} value The search query
 * @return {ResourceFilter} The actual filter
 * @throws {TypeError} An error if value is not a String
 */
ResourceFilter.prototype.search = function(value) {
  if (!isValidType(value, ['String'])) throw new TypeError('Invalid value');

  this.operations.push({
    type: ResourceFilter.OPERATORS.SEARCH,
    value: value
  });

  return this;
};

/**
 * Tests if an operation has already been specified.
 *
 * @method hasOperation
 * @param {String} Operation operator
 * @return {Boolean} true if the operation has already been added to this filter, false otherwise
 */
ResourceFilter.prototype.hasOperation = function(operator) {
  for (var i = 0; i < this.operations.length; i++)
    if (this.operations[i].type === operator) return true;

  return false;
};

/**
 * Gets an operation from filter or sub filters.
 *
 * @method getComparisonOperation
 * @param {String} Operation operator
 * @param {String} Operation field
 * @return {Object|Null} The operation with:
 * -**String** type The operation type
 * -**String** field The operation field
 * -**String|Number|Boolean|Date** value The operation value
 */
ResourceFilter.prototype.getComparisonOperation = function(operator, field) {
  for (var i = 0; i < this.operations.length; i++) {
    if ([
      ResourceFilter.OPERATORS.OR,
      ResourceFilter.OPERATORS.NOR,
      ResourceFilter.OPERATORS.AND
    ].indexOf(this.operations[i].type) >= 0) {
      for (var j = 0; j < this.operations[i].filters.length; j++) {
        var result = this.operations[i].filters[j].getComparisonOperation(operator, field);
        if (result) return result;
      }
    } else if (this.operations[i].type === operator && (!field || this.operations[i].field === field))
      return this.operations[i];
  }

  return null;
};
