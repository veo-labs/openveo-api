'use strict';

var assert = require('chai').assert;
var ResourceFilter = process.requireApi('lib/storages/ResourceFilter.js');

describe('ResourceFilter', function() {
  var filter;
  var comparisonOperators = [
    ResourceFilter.OPERATORS.EQUAL,
    ResourceFilter.OPERATORS.NOT_EQUAL,
    ResourceFilter.OPERATORS.GREATER_THAN,
    ResourceFilter.OPERATORS.GREATER_THAN_EQUAL,
    ResourceFilter.OPERATORS.LESSER_THAN,
    ResourceFilter.OPERATORS.LESSER_THAN_EQUAL
  ];
  var inOperators = [
    ResourceFilter.OPERATORS.IN,
    ResourceFilter.OPERATORS.NOT_IN
  ];
  var logicalOperators = [
    ResourceFilter.OPERATORS.OR,
    ResourceFilter.OPERATORS.NOR,
    ResourceFilter.OPERATORS.AND
  ];

  // Initiates tests
  beforeEach(function() {
    filter = new ResourceFilter();
  });

  describe('properties', function() {

    it('should not be editable', function() {
      var properties = ['operations'];
      filter = new ResourceFilter();

      properties.forEach(function(property) {
        assert.throws(function() {
          filter[property] = null;
        }, null, null, 'Expected property "' + property + '" to be unalterable');
      });

    });

  });

  comparisonOperators.forEach(function(comparisonOperator) {

    describe(comparisonOperator, function() {

      it('should add a "' + comparisonOperator + '" operation', function() {
        var expectedField = 'id';
        var expectedValue = 42;
        filter[comparisonOperator](expectedField, expectedValue);

        assert.equal(filter.operations.length, 1, 'Wrong number of operations');
        assert.equal(filter.operations[0].type, comparisonOperator, 'Wrong operation type');
        assert.equal(filter.operations[0].field, expectedField, 'Wrong operation field');
        assert.equal(filter.operations[0].value, expectedValue, 'Wrong operation value');
      });

      it('should accept a value as Number, Date, String or Boolean', function() {
        var expectedField = 'id';
        var validValues = [42, new Date(), 'String', false];
        var wrongValues = [{}, []];

        validValues.forEach(function(validValue) {
          assert.doesNotThrow(function() {
            filter[comparisonOperator](expectedField, validValue);
          });
        });

        wrongValues.forEach(function(wrongValue) {
          assert.throws(function() {
            filter[comparisonOperator](expectedField, wrongValue);
          });
        });
      });

      it('should throw a TypeError if field is not a String', function() {
        var wrongValues = [42, {}, [], true];

        wrongValues.forEach(function(wrongValue) {
          assert.throws(function() {
            filter[comparisonOperator](wrongValue, 'Field value');
          });
        });
      });

    });

  });

  inOperators.forEach(function(inOperator) {

    describe(inOperator, function() {

      it('should add a "' + inOperator + '" operation', function() {
        var expectedField = 'id';
        var expectedValue = ['value1', 'value2'];
        filter[inOperator](expectedField, expectedValue);

        assert.equal(filter.operations.length, 1, 'Wrong number of operations');
        assert.equal(filter.operations[0].type, inOperator, 'Wrong operation type');
        assert.equal(filter.operations[0].field, expectedField, 'Wrong operation field');
        assert.deepEqual(filter.operations[0].value, expectedValue, 'Wrong operation value');
      });

      it('should accept an array of values as Number, Date, String or Boolean', function() {
        var expectedField = 'id';
        var validValues = [42, new Date(), 'String', false];
        var wrongValues = [{}, []];

        validValues.forEach(function(validValue) {
          assert.doesNotThrow(function() {
            filter[inOperator](expectedField, [validValue]);
          });
        });

        wrongValues.forEach(function(wrongValue) {
          assert.throws(function() {
            filter[inOperator](expectedField, [wrongValue]);
          });
        });
      });

      it('should throw a TypeError if value is not an Array', function() {
        var wrongValues = ['String', 42, true, {}];

        wrongValues.forEach(function(wrongValue) {
          assert.throws(function() {
            filter[inOperator]('id', wrongValue);
          });
        });
      });

    });

  });

  logicalOperators.forEach(function(logicalOperator) {

    describe(logicalOperator, function() {

      it('should add a "' + logicalOperator + '" operation', function() {
        var expectedFilters = [new ResourceFilter(), new ResourceFilter()];
        filter[logicalOperator](expectedFilters);

        assert.equal(filter.operations[0].type, logicalOperator, 'Wrong operation type');
        assert.deepEqual(filter.operations[0].filters, expectedFilters, 'Wrong operation filters');
      });

      it('should not add more than one "' + logicalOperator + '" operation', function() {
        var filters = [new ResourceFilter(), new ResourceFilter()];
        var expectedFilters = filters.concat(filters);
        filter[logicalOperator](filters);
        filter[logicalOperator](filters);

        assert.equal(filter.operations[0].type, logicalOperator, 'Wrong operation type');
        assert.deepEqual(filter.operations[0].filters, expectedFilters, 'Wrong operation filters');
      });

      it('should accept an array of ResourceFilter objects', function() {
        var validValues = [new ResourceFilter()];
        var wrongValues = [{}, [], 42, new Date(), 'String', false];

        validValues.forEach(function(validValue) {
          assert.doesNotThrow(function() {
            filter[logicalOperator](validValue);
          });
        });

        wrongValues.forEach(function(wrongValue) {
          assert.throws(function() {
            filter[logicalOperator](wrongValue);
          });
        });
      });

    });

  });

  describe(ResourceFilter.OPERATORS.SEARCH, function() {

    it('should add a "' + ResourceFilter.OPERATORS.SEARCH + '" operation', function() {
      var expectedValue = 'query search';
      filter[ResourceFilter.OPERATORS.SEARCH](expectedValue);

      assert.equal(filter.operations[0].type, ResourceFilter.OPERATORS.SEARCH, 'Wrong operation type');
      assert.equal(filter.operations[0].value, expectedValue, 'Wrong operation value');
    });

    it('should throw a TypeError if value is not a String', function() {
      var wrongValues = [[], 42, true, {}];

      wrongValues.forEach(function(wrongValue) {
        assert.throws(function() {
          filter[ResourceFilter.OPERATORS.SEARCH](wrongValue);
        });
      });
    });

  });

  describe(ResourceFilter.OPERATORS.REGEX, function() {

    it('should add a "' + ResourceFilter.OPERATORS.REGEX + '" operation', function() {
      var expectedValue = /42/i;
      var expectedField = 'field';
      filter[ResourceFilter.OPERATORS.REGEX](expectedField, expectedValue);

      assert.equal(filter.operations[0].type, ResourceFilter.OPERATORS.REGEX, 'Wrong operation type');
      assert.equal(filter.operations[0].field, expectedField, 'Wrong operation field');
      assert.equal(filter.operations[0].value, expectedValue, 'Wrong operation value');
    });

    it('should throw a TypeError if value is not a RegExp', function() {
      var wrongValues = [[], 42, true, {}, 'String'];

      wrongValues.forEach(function(wrongValue) {
        assert.throws(function() {
          filter[ResourceFilter.OPERATORS.REGEX]('field', wrongValue);
        });
      });
    });

  });

  describe(ResourceFilter.OPERATORS.EXISTS, function() {

    it('should add a "' + ResourceFilter.OPERATORS.EXISTS + '" operation', function() {
      var expectedValue = true;
      var expectedField = 'field';
      filter[ResourceFilter.OPERATORS.EXISTS](expectedField, expectedValue);

      assert.equal(filter.operations[0].type, ResourceFilter.OPERATORS.EXISTS, 'Wrong operation type');
      assert.equal(filter.operations[0].field, expectedField, 'Wrong operation field');
      assert.equal(filter.operations[0].value, expectedValue, 'Wrong operation value');
    });

    it('should throw a TypeError if value is not a boolean', function() {
      var wrongValues = [[], 42, /regexp/, {}, 'String'];

      wrongValues.forEach(function(wrongValue) {
        assert.throws(function() {
          filter[ResourceFilter.OPERATORS.EXISTS]('field', wrongValue);
        });
      });
    });

  });

  describe('hasOperation', function() {

    it('should return true if an operation type is already present in the list of operations', function() {
      comparisonOperators.forEach(function(comparisonOperator) {
        filter[comparisonOperator]('id', 'value');
        assert.ok(filter.hasOperation(comparisonOperator));
      });

      inOperators.forEach(function(inOperator) {
        filter[inOperator]('id', ['value']);
        assert.ok(filter.hasOperation(inOperator));
      });

      logicalOperators.forEach(function(logicalOperator) {
        filter[logicalOperator]([new ResourceFilter()]);
        assert.ok(filter.hasOperation(logicalOperator));
      });

      filter[ResourceFilter.OPERATORS.SEARCH]('query search');
      assert.ok(filter.hasOperation(ResourceFilter.OPERATORS.SEARCH));

      filter[ResourceFilter.OPERATORS.REGEX]('field', /42/i);
      assert.ok(filter.hasOperation(ResourceFilter.OPERATORS.REGEX));
    });

    it('should return false if an operation type is not present in the list of operations', function() {
      comparisonOperators.forEach(function(comparisonOperator) {
        assert.notOk(filter.hasOperation(comparisonOperator));
      });

      inOperators.forEach(function(inOperator) {
        assert.notOk(filter.hasOperation(inOperator));
      });

      logicalOperators.forEach(function(logicalOperator) {
        assert.notOk(filter.hasOperation(logicalOperator));
      });

      assert.notOk(filter.hasOperation(ResourceFilter.OPERATORS.SEARCH));
      assert.notOk(filter.hasOperation('field', ResourceFilter.OPERATORS.REGEX));
    });

  });

  describe('getComparisonOperation', function() {

    it('should return the first comparison operation corresponding to specified field and type', function() {
      comparisonOperators.forEach(function(comparisonOperator) {
        var expectedValue = 'value-' + comparisonOperator;
        filter = new ResourceFilter();
        filter[comparisonOperator]('field', expectedValue);
        var operation = filter.getComparisonOperation(comparisonOperator, 'field');
        assert.equal(operation.value, expectedValue, 'Wrong value for operator ' + comparisonOperator);
      });

      inOperators.forEach(function(inOperator) {
        var expectedValue = ['value-' + inOperator];
        filter = new ResourceFilter();
        filter[inOperator]('field', expectedValue);
        var operation = filter.getComparisonOperation(inOperator, 'field');
        assert.strictEqual(operation.value, expectedValue, 'Wrong value for operator ' + inOperator);
      });

      var expectedValue = /42/i;
      filter = new ResourceFilter();
      filter[ResourceFilter.OPERATORS.REGEX]('field', expectedValue);
      var operation = filter.getComparisonOperation(ResourceFilter.OPERATORS.REGEX, 'field');
      assert.strictEqual(operation.value, expectedValue, 'Wrong value for operator ' + ResourceFilter.OPERATORS.REGEX);
    });

    it('should be able to get the comparison operator from filters contained in a logical operation', function() {
      logicalOperators.forEach(function(logicalOperator) {
        var expectedValue = 'value-' + logicalOperator;
        filter = new ResourceFilter();
        filter[logicalOperator]([
          new ResourceFilter().and([new ResourceFilter().equal('field', expectedValue)])
        ]);
        var operation = filter.getComparisonOperation(ResourceFilter.OPERATORS.EQUAL, 'field');
        assert.strictEqual(operation.value, expectedValue, 'Wrong value for operator ' + logicalOperator);
      });
    });

    it('should be able to get a search operator', function() {
      var expectedSearch = 'query';
      var filter = new ResourceFilter().search(expectedSearch);
      assert.equal(
        filter.getComparisonOperation(ResourceFilter.OPERATORS.SEARCH).value,
        expectedSearch,
        'Wrong search value'
      );
    });

    it('should return null if operation has not been found', function() {
      assert.isNull(filter.getComparisonOperation(ResourceFilter.OPERATORS.EQUAL, 'field'));
    });

  });

  describe('getLogicalOperation', function() {

    it('should return the first logical operation corresponding to specified type', function() {
      logicalOperators.forEach(function(logicalOperator) {
        var expectedSubFilters = [new ResourceFilter()];
        filter = new ResourceFilter();
        filter[logicalOperator](expectedSubFilters);
        var operation = filter.getLogicalOperation(logicalOperator);
        assert.strictEqual(operation.filters, expectedSubFilters, 'Wrong filters for operator ' + logicalOperator);
      });
    });

    it('should be able to get the logical operation from filters contained in another logical operation', function() {
      logicalOperators.forEach(function(logicalOperator) {
        var expectedSubFilters = [new ResourceFilter()];
        filter = new ResourceFilter();

        // Test with logical operators which are not current logical operator to search for
        var topLogicalOperators = logicalOperators.filter(function(topLogicalOperator) {
          return topLogicalOperator !== logicalOperator;
        });

        topLogicalOperators.forEach(function(topLogicalOperator) {
          filter[topLogicalOperator]([
            new ResourceFilter()[logicalOperator](expectedSubFilters)
          ]);
          var operation = filter.getLogicalOperation(logicalOperator);
          assert.strictEqual(operation.filters, expectedSubFilters, 'Wrong filters for operator ' + logicalOperator);
        });
      });
    });

    it('should return null if operation has not been found', function() {
      assert.isNull(filter.getLogicalOperation(ResourceFilter.OPERATORS.OR));
    });

  });

});
