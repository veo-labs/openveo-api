angular.module('test-module').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('1.html',
    '<div>First template to put into cache</div>'
  );

  $templateCache.put('2.html',
    '<div>Second template to put into cache</div>'
  );

}]);
