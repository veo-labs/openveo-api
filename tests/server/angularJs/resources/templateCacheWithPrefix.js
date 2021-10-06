angular.module('test-module').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('prefix1.html',
    '<div>First template to put into cache</div>'
  );

  $templateCache.put('prefix2.html',
    '<div>Second template to put into cache</div>'
  );

}]);
