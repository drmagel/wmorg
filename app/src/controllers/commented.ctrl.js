/*
wmoControllers.controller('ValidateCtrl', ['$window', '$scope', 'Validate',
  function($window, $scope, Validate) {
    $scope.validate = function(email, passwd) {
      var sessID = $window.sessionStorage.getItem('sessID');
      Validate.get({email: email, password: password, sessID: sessID}, function(res) {
        return $scope.response = res;
      });
    };
  }]);

wmoControllers.controller('setLangCtrl', ['$window', '$rootScope', '$scope',
  function($window, $rootScope, $scope) {
    var getDirection = function(lang){
      if($RTLS.indexOf(lang) > -1){return 'rtl'};
      return 'ltr';
    };
    var getOppositeFloatDirection = function(direction) {
      if(direction === 'rtl'){return 'left'};
      return 'right';
    };

    $rootScope.lang = {
      lang:      $window.sessionStorage.getItem('lang') || 'eng',
      direction: $window.sessionStorage.getItem('direction') || 'ltr',
      oppositeFloat: $window.sessionStorage.getItem('oppositeFloat') || 'right',
      tr: function(arg){
            if(arg.isArray){
              return arg.map(function(str){return $DICT[str][this.lang]})
            };
            return $DICT[arg][this.lang];
            }
    };
    $rootScope.setLang = function(lang){
      var lang = lang || 'eng';
      var direction = getDirection(lang);
      var oppositeFloat = getOppositeFloatDirection(direction);
      $rootScope.lang.lang = lang;
      $rootScope.lang.direction = direction;
      $rootScope.lang.oppositeFloat = oppositeFloat;
      $window.sessionStorage.setItem('lang', lang);
      $window.sessionStorage.setItem('direction', direction);
      $window.sessionStorage.setItem('oppositeFloat', oppositeFloat);
    };
    $scope.langs = $LANGS;
  }]);
*/
