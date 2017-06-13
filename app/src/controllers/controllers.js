'use strict';

/* Controllers */

var wmoControllers = angular.module('wmoControllers', []);

wmoControllers.controller('LogoutCtrl', ['$window', '$location', '$rootScope', 'Logout',
  function($window, $location, $rootScope, Logout) {
    var sessID = $window.sessionStorage.getItem('sessID');
    Logout.get({sessID: sessID}, function(res){
//    $window.sessionStorage.clear(); // Completely clearing the sessionStorage
      $window.sessionStorage.setItem('sessID', '');
      $window.sessionStorage.setItem('userID', '');
      $window.sessionStorage.setItem('email',  '');
      delete $rootScope.user;
      $location.path($LOGIN).replace();      
    });
  }]);
  
wmoControllers.controller('LoginCtrl', ['$window', '$scope', '$location', 'Login',
  function($window, $scope, $location, Login) {
    var submitUrl = $USERS;
    
    $scope.login = function(email, password) {      
      Login.get({email: email, password: password}, function(res){
        if(!!res.result) {
          $window.sessionStorage.setItem('sessID', res.sessID);
          $window.sessionStorage.setItem('userID', res.userID);
          $window.sessionStorage.setItem('email',  email);
          submitUrl = submitUrl + res.userID + '/' + res.sessID;
          $location.path(submitUrl).replace();
        }
//console.log(res);        
        return $scope.response = res;
      });
    };

    $scope.showAlert = function(){
      if(($scope.response || {}).reason === undefined) {return false};
      if(!!$scope.response.reason){$scope.inputChanged = false;}
      return !!$scope.response.reason;
    };
    $scope.dissmissAlert = function(){
      delete $scope.password;
      return $scope.response.reason = false;
    };
    $scope.alertMessage = function(){
      return ($scope.response || {}).reason || 'no_reason';
    };
    $scope.changed = function(){
      return $scope.inputChanged = true;
    };
    $scope.disabled = function() {
      return !!!(!!$scope.email && !!$scope.password && !!$scope.inputChanged);
    };
  }]);

wmoControllers.controller('EnrollCtrl', ['$window', '$scope', '$rootScope', '$uibModal', '$location', 'Enroll',
  function($window, $scope, $rootScope, $uibModal, $location, Enroll) {
    $scope.enroll = function(email) {
      var lang = $window.sessionStorage.getItem('lang') || 'eng';
      Enroll.get({email: email, lang: lang}, function(res){
        if(!!res.result) {
          $scope.number = res.number;
          $scope.string = res.string;
          $scope.openModal();
        }
//console.log(res);        
          return $scope.response = res;
      });
    };

    $scope.openModal = function() {
      var modal = $uibModal.open({
        animation: true,
        keyboard: true,
        backdrop: 'static', //'true' 'false', or 'static'
        templateUrl: $TMPL + 'enroll.html',
        controller: 'ModalEnrollCtrl',
        size: 'md', //'sm' - small; 'md' - medium; 'lg' - large
        resolve: {
          validNumber: function(){
            return $scope.number;
          },
          validString: function(){
            return $scope.string;
          },
          validEmail: function(){
            return $scope.email;
          }
        }
      });
      modal.result.then(
        function(email){
          $window.sessionStorage.setItem('email', email);
          $location.path($REGISTER + $START).replace(); //redirection to register.html
        },
        function(){
          $window.sessionStorage.setItem('email', '');
        }
      );
    };

    $scope.showAlert = function(){
      if(($scope.response || {}).reason === undefined) {return false};
      if(!!$scope.response.reason){$scope.inputChanged = false;}
      return !!$scope.response.reason;
    };
    $scope.dissmissAlert = function(){
      delete $scope.email;
      return $scope.response.reason = false;
    };
    $scope.alertMessage = function(){
      return (($scope.response || {}).reason) || 'no_reason';
    };
    $scope.changed = function(){
      return $scope.inputChanged = true;
    };
    $scope.disabled = function() {
      return !(!!$scope.email && !!$scope.inputChanged);
    };
    
  }]);
  

wmoControllers.controller('ModalEnrollCtrl', ['$scope', '$rootScope', '$uibModalInstance', 'validNumber', 'validString', 'validEmail',
  function($scope, $rootScope, $uibModalInstance, validNumber, validString, validEmail) {
    $scope.validNumber = validNumber;
    $scope.validString = validString;
    $scope.validEmail  = validEmail;
    $scope.input = {};

    $scope.validateNumber = function(){
      return $scope.validNumber === $scope.input.verNumber;
    };
    
    $scope.validateString = function(){
      return $scope.validString === $scope.input.verString;
    };
    
    $scope.disabled = function() {
      return !!!($scope.validateString() && $scope.validateString());
    };    
    $scope.register = function() {
      $uibModalInstance.close($scope.validEmail);
    };
    $scope.cancel = function() {
      $uibModalInstance.dismiss('canceled');
    };
  }]);


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
          break;
        case 'personalDetails':
            return !!!(
                        (($rootScope.user.firstName  || '').length > 0) &&
                        (($rootScope.user.familyName || '').length > 0) &&
                        (($rootScope.user.city || '').length > 0)       &&
                        !!($scope.validatePhoneNumber())
                      )
          break;
        case 'bankAccounts':
            return !!!(($rootScope.user.bankAccounts || []).length > 0)
          break;
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


wmoControllers.controller('ModalManageBankAccountCtrl', ['$scope', '$uibModalInstance', 'FilterSortTranslated', 'bankAccounts', 'country', 'openValue',
  function($scope, $uibModalInstance, FilterSortTranslated, bankAccounts, country, openValue) {
    var country = country
      , openValue = openValue
      , account = {};
      
    $scope.bankAccounts = bankAccounts;
    $scope.btnName = 'add';
    $scope.removeBankAccount = function(n){
      $scope.bankAccounts.splice(n, 1);
    };
    $scope.createBankList = function(){
      $scope.bankList = FilterSortTranslated($COUNTRIES[country].bankList);
      $scope.bankName = account.bank = $scope.bankList[0];
    };

    var saveBankAccout = function(n){
      return function(){
        $scope.bankAccounts[n] = JSON.parse(JSON.stringify(account));
        $scope.cleanAndClose();
      };
    };

    var addToBankAccounts = function(){
      $scope.bankAccounts.push({bank: account.bank,
                                branch: account.branch,
                                account: account.account,
                                accountOwner: account.accountOwner
                               });
      $scope.cleanAndClose();
    };

    var disableAddAccount = function(){
      return ! ((!!account.branch  || false) &&
             (!!account.account  || false) &&
             (!!account.accountOwner || false))
    }
    
    $scope.setBankName = function(value){account.bank = value};
    $scope.setBankBranch = function(value){account.branch = value};
    $scope.setBankAccount = function(value){account.account = value};
    $scope.setAccountOwner = function(value){account.accountOwner = value};
    
    $scope.editBankAccout = function(n){
      account = JSON.parse(JSON.stringify($scope.bankAccounts[n]));;
      $scope.bankName = account.bank;
      $scope.bankBranch = account.branch;
      $scope.bankAccount = account.account;
      $scope.accountOwner = account.accountOwner;
      $scope.bankAccountFormTmpl = 'BankAccountFormTmpl.html';
      $scope.btnFunction = saveBankAccout(n);
      $scope.disabledAdd = function(){return false};
      $scope.btnSign = 'ok';
      $scope.btnClass = 'primary';
    };
    
    $scope.addBankAccount = function(){
      $scope.bankAccountFormTmpl = 'BankAccountFormTmpl.html';
      $scope.btnFunction = addToBankAccounts;
      $scope.disabledAdd = disableAddAccount;
      $scope.btnSign = 'plus';
      $scope.btnClass = 'success';
    };

    $scope.cleanAndClose = function(){
      delete $scope.bankName;
      delete $scope.bankBranch;
      delete $scope.bankAccount;
      delete $scope.accountOwner;
      delete $scope.bankAccountFormTmpl;
      account = {};
    };
    
    $scope.isFormOpened = function(){
      return !!$scope.bankAccountFormTmpl;
    };
    
    $scope.initAddAccount = function(){
      if(openValue === 'add'){$scope.addBankAccount()};
    };

    $scope.disabled = function(){
      return $scope.bankAccounts.length === 0;
    };
    $scope.done = function(){
      $uibModalInstance.close($scope.bankAccounts);
    };
    $scope.cancel = function(){
      $uibModalInstance.dismiss('canceled');
    };
  }]);

wmoControllers.controller('ModalValidateByPasswordCtrl', ['$window', '$scope', '$uibModalInstance', 'Validate', 'modalHeader', 'modalCancel',
  function($window, $scope, $uibModalInstance, Validate, modalHeader, modalCancel) {
    $scope.modalHeader = modalHeader;
    $scope.modalCancel   = modalCancel;

// passwdValidateRE = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-=!@#$%+]).{6,}/ - from the globals.js file
    var validatePasswd = function(){
          return passwdValidateRE.test($scope.data.password);
        }
      , response = {}
      , inputChanged = true
      , email  = $window.sessionStorage.getItem('email')
      , sessID = $window.sessionStorage.getItem('sessID')
      ;
    $scope.data = {email: email, sessID: sessID};

// Check Password    
    $scope.showAlert = function(){
      if(response.reason === undefined) {return false};
      if(!!response.reason){inputChanged = false;}
      return !!response.reason;
    };
    $scope.dissmissAlert = function(){
      delete $scope.data.password;
      return response.reason = false;
    };
    $scope.alertMessage = function(){
      response.reason === 'invalid_credentials' && (response.reason = 'wrong_password');
      return response.reason || 'no_reason';
    };
    $scope.changed = function(){
      return inputChanged = true;
    };
    $scope.disabled = function(){
      return !!!(validatePasswd() && inputChanged);
    };
    
// Confirm by password - $uibModalInstance
    $scope.confirm = function(){
      Validate.get($scope.data, function(res){
        if(!!res.result){
          $uibModalInstance.close('confirmed');
        }
        return response = res;
      })
    };
    $scope.cancel = function(){
      $uibModalInstance.dismiss('canceled');
    };
  }]);

wmoControllers.controller('ModalOperationResponseCtrl', ['$scope', '$uibModalInstance', 'modalHeader', 'modalStatus',
  function($scope, $uibModalInstance, modalHeader, modalStatus) {
    $scope.operModal = {title: modalHeader};
    switch(modalStatus){
      case 'success':
        $scope.operModal.glyphicon = 'glyphicon-ok-circle';
        $scope.operModal.alert = 'alert-success';
      break;
      case 'failure':
        $scope.operModal.glyphicon = 'glyphicon-ban-circle';
        $scope.operModal.alert = 'alert-danger';
      break;
      default:;
    };

    
// $uibModalInstance
    $scope.close = function(){
      $uibModalInstance.close('confirmed');
    };
    $scope.cancel = function(){
      $uibModalInstance.dismiss('canceled');
    };
  }]);

  
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

wmoControllers.controller('ModalLogoutCtrl', ['$scope', '$uibModalInstance',
  function($scope, $uibModalInstance) {
    $scope.logout = function(){
      $uibModalInstance.close('logout');
    };
    $scope.cancel = function(){
      $uibModalInstance.dismiss('canceled');
    };
  }]);
    
wmoControllers.controller('CreatePlanCtrl', ['$window', '$location', '$scope', '$rootScope',
                                             'Calendar', 'OperatePlan', 'ValidateByPassword',
  function($window, $location, $scope, $rootScope, Calendar, OperatePlan, ValidateByPassword) {
    $scope.plan = {description:{}}; // Obligated for PlanPropertiesCtrl controller.

    $scope.newPlans = [];    
    $scope.disableEditing = true;
    $scope.dateFormat = $PLANPROPERTIES.planDateFormat;
    
    var userID = $window.sessionStorage.getItem('userID') || ''
      , sessID = $window.sessionStorage.getItem('sessID') || ''
      ;

    $scope.localTime = function(time){
      return Calendar.local(time);
    };
    $scope.cleanPlan = function(){
      $scope.plan = {description:{}};     
      $scope.planPropertiesTmpl = $rootScope.planPropertiesTmpl + '?r=' + Math.random();
    };  
/*    
    $scope.cleanPlan = function(){
      ValidateByPassword.response('success', 'operationSuccess', function(){console.log('ValidateByPassword.response:OK-callback')})
//      ValidateByPassword.response('failure', 'permissionDenied', function(){console.log('ValidateByPassword.response:OK-callback')})
    }
*/
    $scope.addPlan = function(){
      $scope.newPlans.push($scope.plan);
      $scope.cleanPlan();
    };    
    $scope.editPlan = function(n){
      $scope.disableEditing = false;
      $scope.plan = JSON.parse(JSON.stringify($scope.newPlans[n]));
      $scope.planPropertiesTmpl = $rootScope.planPropertiesTmpl + '?r=' + Math.random();
    };
    $scope.removePlan = function(n){
      $scope.newPlans.splice(n, 1);
    };
    $scope.doneEditing = function(){
      var p = $scope.plan;
      $scope.disableEditing = true;
      $scope.newPlans[p.ind] = p;
      $scope.cleanPlan();
    };
    
    $scope.addPlanValidation = function(){
      var p = $scope.plan
        , d = p.description
        ;
      return !!!(
                  p.fromDate > 0 &&
                  (p.tillDate > 0 || p.tillDate === 'permanent') &&
                  p.duration > 0 &&
                  p.interest > 0 &&
                  (d.constructor === Object && Object.keys(d).length > 0)
                );
    };
    
    $scope.createInSystem = function(){
      ValidateByPassword.validate('newPlanCreation', 'cancel',
        function(){ // OK-callback                
          var counter = $scope.newPlans.length;
          $scope.newPlans.forEach(function(el){
            delete el.ind;
            if(--counter === 0){
              OperatePlan.create({'plan': $scope.newPlans, 'userID': userID, 'sessID': sessID}, function(res){
                $scope.newPlans = [];
                if (!!res.result){
                  ValidateByPassword.response('success', 'operationSuccess');
                } else {
                  switch(res.reason){
                    case 'invalid_sessid':
                      ValidateByPassword.response('failure', 'invalidSession',
                        function(){$location.path($LOGOUT).replace();}) // Logout
                    break;
                    case 'permission_denied':
                      ValidateByPassword.response('failure', 'permissionDenied',
                        function(){$location.path($LOGOUT).replace();}) // Logout
                    break;
                    default:;
                  }
                }
              })
            }
          });
        },
        function(){ // Cancel-callback
        // Do nothing, just close a Modal
        }
      );          
    };    
  }]);

wmoControllers.controller('PlanPropertiesCtrl', ['$scope', '$rootScope', 'Calendar', 'LangMngr',
  function($scope, $rootScope, Calendar, LangMngr) {
    // $scope.plan = {description:{}}; // Must be defined in the parent controller.
    var today = Calendar.today() // UTC Time
      , local = Calendar.local // The time is UTC format, exept of Calendar.yyyyMMdd
      , pndStartPer = $PLANPROPERTIES.pendingStartPeriod
      , pndFinishPer = $PLANPROPERTIES.pendingFinishPeriod
      , minActPer = $PLANPROPERTIES.minActivePeriod
      , activePeriod = minActPer
      , percentageLength = 5
      , maxPlanDuration = $PLANPROPERTIES.maxPlanDuration
      , maxPlanPercentage = $PLANPROPERTIES.maxPlanPercentage
      ;

// Helpers
    function initMinTillDate(){
      var fd = $scope.plan.fromDate;
      if (fd <= today){ // Edit Active Plan
        if(Calendar.dayPeriod(fd, today) > minActPer){ // The minumum active period is over.         
          return pndFinishPer;
        } else { // minumum active period + pending finish period
          return minActPer + pndFinishPer - Calendar.dayPeriod(fd, today);
        }
      } else { // Edit Pending Plan    
          return Calendar.dayPeriod(today, fd) + minActPer;
      }
    }

// Init
    $scope.percentageLength = percentageLength;
    $scope.maxPlanDuration = maxPlanDuration;
    $scope.tillDateInput = 'init';
    $scope.minFromDate = pndStartPer;
    $scope.minTillDate = pndStartPer + minActPer;

    
    $scope.setInputLang = function(){
      $scope.dr = {};
      $LANGS.forEach(function(lang){
        var l = lang.value
          ,dir = LangMngr.getDirection(l)
          ;
        $scope.dr[l] = {};
        $scope.dr[l].Dir = dir;
        $scope.dr[l].FltDir = LangMngr.getFloatDirection(dir);
        $scope.dr[l].OppFltDir = LangMngr.getOppositeFloatDirection(dir);
      });
    };

// Plan: New or Editing
/*
    if (typeof $scope.plan.fromDate === 'undefined'){ // New
      $scope.fromDate = Calendar.yyyyMMdd(Calendar.addDays(today, pndStartPer), '-');
      $scope.plan.fromDate = Calendar.utc($scope.fromDate).getTime();
    } else {                                          // Editing
      $scope.fromDate = Calendar.yyyyMMdd($scope.plan.fromDate, '-');
      $scope.tillDate = Calendar.yyyyMMdd(Calendar.addDays($scope.fromDate, minActPer), '-');
    };
    if(typeof $scope.plan.tillDate === 'undefined'){ // New
      $scope.tillDate = Calendar.yyyyMMdd(Calendar.addDays(today, pndStartPer + minActPer), '-');
      $scope.plan.tillDate = Calendar.utc($scope.tillDate).getTime();
    } else {                                        // Editing
      if($scope.plan.tillDate === 'permanent'){
        $scope.tillDateInput = 'unlimited';
      } else {
        $scope.tillDate = Calendar.yyyyMMdd($scope.plan.tillDate, '-');
        activePeriod = Calendar.dayPeriod($scope.plan.fromDate, $scope.plan.tillDate);
      }
    }
*/    
    if (typeof $scope.plan.fromDate === 'undefined'){ // New FromDate
      $scope.fromDate = Calendar.yyyyMMdd(Calendar.addDays(today, pndStartPer), '-');
      $scope.plan.fromDate = Calendar.utc($scope.fromDate).getTime();
    } else {                                          // Editing
      $scope.fromDate = Calendar.yyyyMMdd($scope.plan.fromDate, '-');
      $scope.tillDate = Calendar.yyyyMMdd(Calendar.addDays($scope.fromDate, minActPer), '-');
    };
    if(typeof $scope.plan.tillDate === 'undefined'){ // New TillDate
      $scope.tillDate = Calendar.yyyyMMdd(Calendar.addDays(today, pndStartPer + minActPer), '-');
      $scope.plan.tillDate = Calendar.utc($scope.tillDate).getTime();
    } else {                                        // Editing
      $scope.minTillDate = initMinTillDate();
      if($scope.plan.tillDate === 'permanent'){ // Permanent
        $scope.tillDateInput = 'unlimited';
        $scope.tillDate = Calendar.yyyyMMdd(Calendar.addDays(today, $scope.minTillDate), '-');
      } else { // Date
        $scope.tillDateInput = 'date';
        $scope.tillDate = Calendar.yyyyMMdd($scope.plan.tillDate, '-');
        activePeriod = Calendar.dayPeriod($scope.plan.fromDate, $scope.plan.tillDate);
      }
    }

// Dates - Calendar    
    $scope.setFromDate = function(inp){
      var inp = Calendar.utc(inp)
        , td  = Calendar.addDays(inp, minActPer)
        ;
      $scope.plan.fromDate = inp.getTime();
      $scope.minTillDate = minActPer + Calendar.dayPeriod(today, inp);
      $scope.tillDateInput = 'init'; // For datepicker reacreation
      if(activePeriod > 0){td = Calendar.addDays(inp, activePeriod)};
      $scope.tillDate = Calendar.yyyyMMdd(td, '-');     
    };       
    $scope.setTillDate = function(inp){
      var inp = Calendar.utc(inp);
      $scope.plan.tillDate = inp.getTime();
      activePeriod = Calendar.dayPeriod($scope.plan.fromDate, $scope.plan.tillDate);
    };   
    $scope.setTillDateInput = function(arg){
      $scope.tillDateInput = arg;
      if(arg === 'unlimited'){$scope.plan.tillDate = 'permanent'};
      if(arg === 'date'){$scope.plan.tillDate = Calendar.utc($scope.tillDate).getTime();}
    };
    
// Validations
    $scope.validatePercentage = function(flt){
      if(flt.length === 0){$scope.percentageLength = percentageLength;}
      if(flt.match(/,$/)){flt = flt.replace(/,$/,'.')};
      if(flt.match(/^\./)){
        flt = flt.replace(/^\./,'0.');
        $scope.percentageLength = percentageLength - 1;
      }
      if(flt.match(/\..*\.$/)){flt = flt.slice(0, -1)};
      if(!flt.match(/[\d\.]$/)){flt = flt.slice(0, -1)};
      if(Number(flt) > maxPlanPercentage){flt = flt.slice(0, -1)}
      return flt;
    };    
    $scope.validateDuration = function(dig){
      if(!dig.match(/[\d]$/)){dig = dig.slice(0, -1)};
      if(Number(dig) < 1 || Number(dig) > maxPlanDuration){dig = dig.slice(0, -1)}
      return dig;
    };

// Enables
    $scope.enableProperties = function(){
      if (typeof $scope.plan.fromDate === 'undefined' ||
          typeof $scope.plan.tillDate === 'undefined'){return true}; // New plan
      return $scope.plan.fromDate > today; // true for Pending plans
    };
    $scope.enableActivePeriod = function(){
      if (typeof $scope.plan.fromDate === 'undefined' ||
          typeof $scope.plan.tillDate === 'undefined'){return true}; // New plan
      if($scope.plan.tillDate === 'permanent'){return true;} // Enable update from 'Pernament' to 'Date'
      return $scope.plan.tillDate > today; // true for Pending and Active plans      
    };
    $scope.disableFromDate = function(){
      if (typeof $scope.plan.fromDate === 'undefined'){return false}; // New plan
      if ($scope.plan.fromDate <= today){return true};
      return false; // false for Pending plans
    };
  }]);
  
wmoControllers.controller('GetPlansCtrl', ['$window', '$scope', '$rootScope', '$location',
                                           'GetPlans','Calendar', 'ValidateByPassword', 'OperatePlan',
  function($window, $scope, $rootScope, $location, GetPlans, Calendar, ValidateByPassword, OperatePlan) {
    var query = $rootScope.operand
      , today = Calendar.today()
      , userID = $window.sessionStorage.getItem('userID') || ''
      , sessID = $window.sessionStorage.getItem('sessID') || ''
      , pageHeaders = { 'getActive':    'activePlans',
                        'getCompleted': 'completedPlans',
                        'getPending':   'pendingPlans',
                        'getPermanent': 'permanentPlans',
                        'getAll':       'allPlans'
                      }
      ;
     

  // Inits
    $scope.plan = {description:{}}; // Obligated for PlanPropertiesCtrl controller.
    $scope.editPlan = false;
    $scope.dateFormat = $PLANPROPERTIES.planDateFormat;
    $scope.plansToDelete = $scope.plansToDelete || [];
    $scope.planList = $scope.planList || [];
    
      
    $scope.getPlanList = function(){
      GetPlans[query]({userID: userID, sessID: sessID}, function(res){
        if (!!res.result){
          $scope.planList = res.plans;
        }else{
          switch(res.reason){
            case 'sessid_expired':
              ValidateByPassword.validate('sessionExpired', 'logout',
                function(){ // OK-callback                
                  GetPlans[query]({userID: userID, sessID: sessID}, function(res){
                    $scope.planList = res.plans;
                  });
                },
                function(){ // Cancel-callback
                  $location.path($LOGOUT).replace();
                }
              );
            break;
            case 'invalid_sessid':
              ValidateByPassword.response('failure', 'invalidSession',
                function(){$location.path($LOGOUT).replace();}) // Logout
            break;
            default:;
          }
        }
      });
    };
    $scope.localTime = function(time){
      return Calendar.local(time);
    };
    $scope.getPageHeader = function(){
      return pageHeaders[query];
    };
    $scope.checkboxToDelete = function(flag, ind){
      var planID = $scope.planList[ind].planID;
      if(flag){return $scope.plansToDelete.push(planID)}
      $scope.plansToDelete = $scope.plansToDelete.filter(function(el){return el !== planID})
    };
    $scope.showTrashTD = function(){
      return $scope.planList.filter(function(el){return el.fromDate > today}).length > 0;
    };
    $scope.disableCheckbox = function(ind){
      return $scope.planList[ind].fromDate <= today;
    };
    $scope.cleanToDelete = function(){
      $scope.cleanDelete = false;
      $scope.plansToDelete = [];
    };
    $scope.deleteFromSystem = function(){
      ValidateByPassword.validate('removingPlans', 'cancel',
        function(){ // OK-callback                
          OperatePlan.remove({'planID': $scope.plansToDelete, 'userID': userID, 'sessID': sessID}, function(res){
            $scope.plansToDelete = [];
            $scope.cleanDelete = false;
            if (!!res.result){
              GetPlans[query]({userID: userID, sessID: sessID}, function(res){
                $scope.planList = res.plans;
              });
              ValidateByPassword.response('success', 'operationSuccess');
            } else {
              switch(res.reason){
                case 'invalid_sessid':
                  ValidateByPassword.response('failure', 'invalidSession',
                    function(){$location.path($LOGOUT).replace();}) // Logout
                break;
                case 'permission_denied':
                  ValidateByPassword.response('failure', 'permissionDenied',
                    function(){$location.path($LOGOUT).replace();}) // Logout
                break;
                default:;
              }
            }
          })
        },
        function(){ // Cancel-callback
        // Do nothing, just close a Modal
        }
      );      
    };
    $scope.editPlan = function(n){
      $scope.plan = JSON.parse(JSON.stringify($scope.planList[n]));
      $scope.planEditing = true;
      $scope.planPropertiesTmpl = $rootScope.planPropertiesTmpl + '?r=' + Math.random();
    };
    $scope.cancelEditing = function(){
      $scope.planEditing = false;
      $scope.plan = {description:{}};
    };
    $scope.doneEditing = function(){
      var plan = $scope.plan;
      delete plan.ind;
      ValidateByPassword.validate('updatingPlan', 'cancel',
        function(){ // OK-callback                
          OperatePlan.update({'plan': plan, 'userID': userID, 'sessID': sessID}, function(res){
            $scope.plansToDelete = [];
            $scope.cleanDelete = false;
            if (!!res.result){
              $scope.planEditing = false;
              $scope.plan = {description:{}};
              GetPlans[query]({userID: userID, sessID: sessID}, function(res){
                $scope.planList = res.plans;
              });              
              ValidateByPassword.response('success', 'operationSuccess');
            } else {
              switch(res.reason){
                case 'invalid_sessid':
                  ValidateByPassword.response('failure', 'invalidSession',
                    function(){$location.path($LOGOUT).replace();}) // Logout
                break;
                case 'permission_denied':
                  ValidateByPassword.response('failure', 'permissionDenied',
                    function(){$location.path($LOGOUT).replace();}) // Logout
                break;
                default:;
              }
            }
          })
        },
        function(){ // Cancel-callback
        // Do nothing, just close a Modal
        }
      );
    };


  }]);

  
/*

  wmoControllers.controller('', ['$window', '$location',
  function($window, $location) {

  }]);
*/ 

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
  

