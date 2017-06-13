wmoControllers.controller('setLangCtrl', ['$rootScope', '$scope', 'LangMngr',
  function($rootScope, $scope, LangMngr) {
    $rootScope.lang = LangMngr.init();
    $rootScope.setLang = function(lang){
      LangMngr.setLang(lang);
    };
    $scope.langs = $LANGS;
    $scope.langsBar = function(){
      var bar;
      $LANGS.forEach(function(val){
        if(val.value === $rootScope.lang.lang){bar = val.name}
      });
      return bar.slice(0,3);
    }
  }]);

