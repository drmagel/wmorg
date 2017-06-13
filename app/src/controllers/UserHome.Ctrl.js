wmoControllers.controller('UserHomeCtrl', ['$location','$window', '$routeParams', '$rootScope', '$scope', '$uibModal','GetUser', 'ValidateByPassword',
  function($location, $window, $routeParams, $rootScope, $scope, $uibModal, GetUser, ValidateByPassword) {
    var routeUserid = $routeParams.userid || ''
      , routeSessid = $routeParams.sessid || ''
      ;
    $scope.userID = $window.sessionStorage.getItem('userID') || '';
    $scope.sessID = $window.sessionStorage.getItem('sessID') || '';
    
    if ( !($scope.userID.length > 0) ||
         !($scope.sessID.length > 0) ||
         !(routeUserid === $scope.userID) ||
         !(routeSessid === $scope.sessID)
        ) {$location.path($LOGOUT).replace();}
        
    var getUser = function(){
      GetUser.get({userID: $scope.userID, sessID: $scope.sessID},
        function(res){
          if(!!res.result){
            $rootScope.user = res.user;
            $scope.currencySign = $COUNTRIES[$rootScope.user.country].currency.sign;              
          } else {
            switch(res.reason){
              case 'invalid_sessid':
                $location.path($LOGOUT).replace(); // Logout
              break;
              case 'sessid_expired':
                ValidateByPassword.validate('sessionExpired', 'logout',
                  function(){ // OK-callback                
                    GetUser.get({userID: $scope.userID, sessID: $scope.sessID},
                      function(res){
                        $rootScope.user = res.user;
                        $scope.currencySign = $COUNTRIES[$rootScope.user.country].currency.sign;     
                    });
                  },
                  function(){ // Cancel-callback
                    $location.path($LOGOUT).replace();
                  }
                );
              break;
              default:;
            }
          }
          return $scope.response = res;
      });
    };
  // User Home Navigation.
    var userHomeNav = {
//      'init': 'CreatePlan',
      'init':         'LoanCollect',
      'userInfo':     'UserInfo',
      'loanCollect':  'LoanCollect',
      'createPlan':   'CreatePlan',
      'getPlans':     'GetPlans',
      'test':         'test'
    };
  // setInclude('userInfo') sets $scope.userHomeIncludeURL variable
    var setInclude = function(page, query){
      var query = query || '';
      $scope.userHomeIncludeURL = $UHTMPL + userHomeNav[page] + '.html';
      if(query.length > 0){
        $scope.userHomeIncludeURL += '?operand=' + query + '&r=' + Math.random();
        $rootScope.operand = query;
      }
    }
    $scope.setIncludeURL = setInclude;
  // initUserHome() runs on ng-init and on click on [WMOrg]
    $scope.initUserHome = function(){
      if((($rootScope.user || {}).userID || '').length === 0){getUser();};
      if(($scope.userHomeIncludeURL || '').length === 0){setInclude('init')};
      // loan/collect statictics
      // messages
    };
    // Scope functions and variables
    $scope.logout = function() {
      var modal = $uibModal.open({
        animation: true,
        keyboard: true,
        backdrop: 'static', //'true' 'false', or 'static'
        templateUrl: $TMPL + 'logout.html',
        controller: 'ModalLogoutCtrl',
        size: 'sm', //'sm' - small; 'md' - medium; 'lg' - large
        resolve: {}
      });
      modal.result.then(
        function(){ // 'OK'
          $location.path($LOGOUT).replace(); // Logout
        },
        function(){} // 'Cancel'
      );
    };
  }]);

