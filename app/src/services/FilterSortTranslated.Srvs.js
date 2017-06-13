wmoServices.factory('FilterSortTranslated', ['$rootScope',
  function($rootScope){
    return function(arr, str){
      var str = ((str || '').length > 0) ? str : false;
      if (!!str){
        var re = "^" + str;
        var regex = new RegExp(re, 'i')
        arr = arr.filter(function(el){
          return regex.test($rootScope.lang.tr(el));
        });
      };
      return arr.sort(function(A, B){
        var a = $rootScope.lang.tr(A).toLowerCase().replace(/\s+/g, '');
        var b = $rootScope.lang.tr(B).toLowerCase().replace(/\s+/g, '');
        if(a > b){return 1};
        if(a < b){return -1};
        return 0;
      });
    };
  }]);

