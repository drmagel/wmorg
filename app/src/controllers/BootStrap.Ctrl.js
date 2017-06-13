wmoControllers.controller('BootStrapCtrl', ['rootScope', '$scope', '$location', 'LangMngr',
  function($rootScope, $scope, $location, LangMngr) {
    var url = $location.path;
    $scope.setLang = function(lang){
      LangMngr.setLang(lang);
      $location.path(url).replace();
    };
    
    

    $scope.carousel = function(tag, direction){
      $(tag).carousel(direction);
    };
    $scope.tab = function(tag){
      console.log("BOOTSTRAP:: TAG: " + tag);
      $(tag).tab('show');
    };
  }]);

