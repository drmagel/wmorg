wmoControllers.controller('CreateUserCtrl', ['$window', '$rootScope', '$scope', '$routeParams', '$location', '$uibModal', 'CreateUser', 'FilterSortTranslated',
  function($window, $rootScope, $scope, $routeParams, $location, $uibModal, CreateUser, FilterSortTranslated) {
    var cancelUrl = $LOGIN;
    var submitUrl = $USERS;
    var Url = $REGISTER;

// MOved to the globals.js - global variables
//    var passwdValidateRE = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-=!@#$%+]).{6,}/;
//    var phoneNumberValidateRE = /\d{9,}/;
    
    var pmList = ['passwd', 'personalDetails', 'bankAccounts', 'submit'];
    var routeStep = Number($routeParams.step);
    $scope.disabled = function(){      
      switch(pmList[routeStep]){
        case 'passwd':
            if(!!($scope.validatePasswd)){$rootScope.password = $scope.password}
            return !!!(
                        (($rootScope.password || '').length > 0) &&
                        ($rootScope.password === $scope.passConfirm)
                      );
// no 'break;' required because of 'return'
//          break;
        case 'personalDetails':
            return !!!(
                        (($rootScope.user.firstName  || '').length > 0) &&
                        (($rootScope.user.familyName || '').length > 0) &&
                        (($rootScope.user.city || '').length > 0)       &&
                        !!($scope.validatePhoneNumber())
                      )
//          break;
        case 'bankAccounts':
            return !!!(($rootScope.user.bankAccounts || []).length > 0)
//          break;
        default: return false;
      }
    };   
    
    var createUser = function(){
      var user = $rootScope.user;
      var password = $rootScope.password;
      var email = $rootScope.email;
      CreateUser.get({email: email, password: password, user: user}, function(res){
        if(!!res.result) {
          $window.sessionStorage.setItem('sessID', res.sessID);
          $window.sessionStorage.setItem('userID', res.userID);
          submitUrl = submitUrl + res.userID + '/' + res.sessID;
          $location.path(submitUrl).replace();
          delete $rootScope.password;
          $rootScope.user = {};
        }
//console.log(res);
        return $scope.response = res;
      });
    };

    
    $rootScope.email = $window.sessionStorage.getItem('email'),
    $rootScope.user = $rootScope.user || {
      language: $rootScope.lang.lang
    };
    $scope.bankAccounts = $rootScope.user.bankAccounts || [];
    $scope.cityInput = ($rootScope.user.city) ? $rootScope.lang.tr($rootScope.user.city) : '';    
    $scope.countries = Object.keys($COUNTRIES);
    $scope.password = '';
    
    $scope.validatePasswd = function(){
      return passwdValidateRE.test($scope.password);
    };
    
    $scope.validatePhoneNumber = function(){
      return phoneNumberValidateRE.test($rootScope.user.phone);
    };
    
    $scope.setCountry = function(ctnr){
      var ctnr = ctnr || $rootScope.user.country || $scope.countries[0];
      $scope.country = ctnr;
      $scope.countryCode = $COUNTRIES[ctnr].countryCode;
      $scope.phoneExample = $COUNTRIES[ctnr].phoneExample;
      $scope.currency = $rootScope.lang.tr($COUNTRIES[ctnr].currency.name) + "    " + $COUNTRIES[ctnr].currency.sign;
      $scope.cities = $COUNTRIES[ctnr].cityList;
      $rootScope.user.country = ctnr;
      $rootScope.user.currency = $COUNTRIES[ctnr].currency.value;     
    },

    $scope.setCity = function(c){
      $scope.cityInput = $rootScope.lang.tr(c);
      $rootScope.user.city = c;
    };

    $scope.cityList = function(c){
      return FilterSortTranslated($COUNTRIES[$scope.country].cityList, c);
    };

    $scope.openBankAccountManager = function(str){
      var modal = $uibModal.open({
        animation: true,
        keyboard: true,
        backdrop: 'static', //'true' 'false', or 'static'
        templateUrl: $TMPL + 'manageBankAccount.html',
        controller: 'ModalManageBankAccountCtrl',
        size: 'md', //'sm' - small; 'md' - medium; 'lg' - large
        resolve: {
          bankAccounts: function(){
            return $scope.bankAccounts;
          },
          country: function(){
            return $rootScope.user.country;
          },
          openValue: function(){
            return str || '';
          }
        }
      });
      modal.result.then(
        function(list){
          $rootScope.user.bankAccounts = list.concat();
        },
        function(){}
      );
    };

/* Process Manager */    
    $scope.nextStr = (routeStep === pmList.length - 1 ) ? 'submit' : 'next';
    $scope.backStr = (routeStep === 0 ) ? 'cancel' : 'back';
    $scope.show = function(page){
      return routeStep === pmList.indexOf(page);
    };
    $scope.next = function(){
      var step = routeStep + 1;
      if (step <= pmList.length - 1) {
        $location.path(Url + step).replace();
      }else{
        createUser();
      }
    }
    $scope.back = function(){
      var step = routeStep - 1;
      if (step < 0){
        $location.path(cancelUrl).replace();
      }else{
        $location.path(Url + step).replace();
      }
    }        
  }]);


