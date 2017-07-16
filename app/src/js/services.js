'use strict';

/* Services */

var wmoServices = angular.module('wmoServices', ['ngResource']);


wmoServices.factory('Account', ['$window',
  function($window){
    return {
      loggedOut: function(){
        return ($window.sessionStorage.getItem('sessID') || '').length === 0;
      },
      loggedIn: function(){
        return ($window.sessionStorage.getItem('sessID') || '').length > 0;
      },
    };
  }]);



wmoServices.factory('Calendar', [
  function(){
    var self = this;
    self.dayMilliSeconds = 1000 * 3600 * 24;
    
    self.factory = {
// time - integer representing the number of milliseconds since 1 January 1970, 00:00:00 UTC
/*
          utc: function(time){
            var d = time || new Date();
            d instanceof Date || (d = new Date(d));
            return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
          },
          today: function(){
            var d = new Date();
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
          },
*/
          utc: function(time){
            var d = time || new Date()
              , offset = new Date().getTimezoneOffset()
              , u;
            d instanceof Date || (d = new Date(d));
            u = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            return new Date(u.setMinutes(u.getMinutes() - offset));
          },
          today: function(){
            return self.factory.utc();
          },
          local: function(time){
            var d = time
              , offset = new Date().getTimezoneOffset()
              ;          
            if(typeof(time) === 'number' || time instanceof Number){ // UTC time integer.
              d = new Date(time);
            }
            return new Date(d.setMinutes(d.getMinutes() + offset));
          },
          addDays: function(date, num){
            var d = date || self.factory.today()
              , num = Number(num);
//            d instanceof Date || (d = self.factory.local(d));
            d instanceof Date || (d = new Date(d));
            return new Date(d.getFullYear(), d.getMonth(), d.getDate() + num);
          },
          addMonths: function(date, num){
            var d = date || self.factory.today()
              , num = Number(num);
//            d instanceof Date || (d = self.factory.local(d));
            d instanceof Date || (d = new Date(d));
            return new Date(d.getFullYear(), d.getMonth() + num, d.getDate());
          },
          addYears: function(date, num){
            var d = date || self.factory.today()
              , num = Number(num);
//            d instanceof Date || (d = self.factory.local(d));
            d instanceof Date || (d = new Date(d));
            return new Date(d.getFullYear() + num, d.getMonth(), d.getDate());
          },
          yyyyMMdd: function(date, pad){
            var d = date || self.factory.today();
            d instanceof Date || (d = self.factory.local(d));
            var pad = pad || ''
              , yyyy = d.getFullYear()
              , MM = Number(d.getMonth()) + 1 // getMonth() is zero-based
              , dd = Number(d.getDate())
              ;
            MM < 10 && (MM = '0' + MM);
            dd < 10 && (dd = '0' + dd);
            return [yyyy, MM, dd].join(pad); // padding
          },
          dayPeriod: function(from, till){
            var from = from || self.factory.today()
              , till = till || self.factory.today();
//            from instanceof Date || (from = self.factory.local(from));
//            till instanceof Date || (till = self.factory.local(till));
            from instanceof Date || (from = new Date(from));
            till instanceof Date || (till = new Date(till));     
            return Math.round(Math.abs(till.getTime() - from.getTime()) / self.dayMilliSeconds);
          },
          dayMilliSeconds: function(){
            return self.dayMilliSeconds;
          }
    }
    return self.factory;
  }]);


wmoServices.factory('CreateUser', ['$resource',
  function($resource){
    return $resource($REST, {}, {
      get: {method:'POST', params:{api:'createUser'}, headers:{'Auth':'createuser'}}
      });
  }]);


wmoServices.factory('Enroll', ['$resource',
  function($resource){
    return $resource($REST, {}, {
      checkEmail: {method:'POST', params:{api:'enroll', operand:'checkEmail'}, headers: {'Auth': 'enroll'}},
      checkPhone: {method:'POST', params:{api:'enroll', operand:'checkPhone'}, headers: {'Auth': 'enroll'}},
      reassert:   {method:'POST', params:{api:'enroll', operand:'reassert'},   headers: {'Auth': 'enroll'}}
    });              
  }]);

/*
wmoServices.factory('Enroll', ['$resource',
  function($resource){
    return $resource($REST, {}, {
      get: {method:'POST', params:{api:'enroll'}, headers:{'Auth':'enroll'}}
    });
  }]);
*/

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


wmoServices.factory('GetPlans', ['$resource','$window',
  function($resource, $window){
    var self = this;
    self.set = function(sessID){
      return $resource($REST, {}, {
        getAll:    {method:'POST', params:{api:'getPlans', operand:'all'},    headers: {'Auth': sessID}},
        getActive:    {method:'POST', params:{api:'getPlans', operand:'active'},    headers: {'Auth': sessID}},
        getPermanent: {method:'POST', params:{api:'getPlans', operand:'permanent'}, headers: {'Auth': sessID}},
        getPending: {method:'POST', params:{api:'getPlans', operand:'pending'}, headers: {'Auth': sessID}},
        getCompleted: {method:'POST', params:{api:'getPlans', operand:'completed'}, headers: {'Auth': sessID}}
      });              
    }
    return {
      getAll: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.getAll(data, fn);
      },
      getActive: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.getActive(data, fn);
      },
      getPermanent: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.getPermanent(data, fn);
      },
      getCompleted: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.getCompleted(data, fn);
      },
      getPending: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.getPending(data, fn);
      }
    }
  }]);


wmoServices.factory('GetUser', ['$resource','$window',
  function($resource, $window){
    var self = this;
    self.set = function(sessID){
      return $resource($REST, {}, {
  //      get: {method:'POST', params:{api:'operateUser'}, headers: {'Auth': sessID}}
        get: {method:'POST', params:{api:'operateUser', operand:'get'}, headers: {'Auth': sessID}},
        update: {method:'POST', params:{api:'operateUser', operand:'update'}, headers: {'Auth': sessID}}
      });
    };
    return {
      get: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
        ;
        resource.get(data, fn);
      },
      update: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
        ;
        resource.update(data, fn);
      }
    }
  }]);


wmoServices.factory('LangMngr', ['$window', '$rootScope',
  function($window, $rootScope){
    var self = this;
    self.lang = $window.sessionStorage.getItem('lang') || 'eng';
    self.direction = $window.sessionStorage.getItem('direction') || 'ltr';
    self.locale = $window.sessionStorage.getItem('locale') || 'en';
    self.factory = {
            getDirection: function(lang){
              if($RTLS.indexOf(lang) > -1){return 'rtl'};
              return 'ltr';
            },
            getOppositeDirection: function(lang){
              if($RTLS.indexOf(lang) > -1){return 'ltr'};
              return 'rtl';
            },
            getFloatDirection: function(direction) {
              if(direction === 'rtl'){return 'right'};
              return 'left';
            },
            getOppositeFloatDirection: function(direction) {
              if(direction === 'rtl'){return 'left'};
              return 'right';
            },
            showLTR: function(){
              return self.direction === 'ltr';
            },
            showRTL: function(){
              return self.direction === 'rtl';
            },
            tr: function(arg, lang){
              var lang = lang || self.lang;
              if(arg.isArray){
                return arg.map(function(str){return $DICT[str][lang]})
              };
              return $DICT[arg][lang];
            },
            getLocale: function(lang){
              return $LANGS.filter(function(e){return e.value === lang})[0].locale;
            },
/*
            tr: function(arg, lang){
              if(arg.isArray){
                return arg.map(function(str){return $DICT[str][self.lang]})
              };
              return $DICT[arg][self.lang];
            },
*/
            setLang: function(lang){
              self.lang = lang;
              self.direction = self.factory.getDirection(lang);
              self.locale = self.factory.getLocale(lang);
              $rootScope.lang.lang = lang;
              $rootScope.lang.direction = self.direction;
              $rootScope.lang.locale = self.locale;
              $rootScope.lang.floatDir = self.factory.getFloatDirection(self.direction);
              $rootScope.lang.oppositeFloatDir = self.factory.getOppositeFloatDirection(self.direction);
              $window.sessionStorage.setItem('lang', lang);
              $window.sessionStorage.setItem('direction', self.direction);
              $window.sessionStorage.setItem('locale', self.locale);
            },
            init: function(){
              return {
                lang: self.lang,
                direction: self.direction,
                locale: self.locale,
                floatDir: self.factory.getFloatDirection(self.direction),
                oppositeFloatDir: self.factory.getOppositeFloatDirection(self.direction),
                tr: self.factory.tr
              }
            }
          };
    return self.factory;
  }]);


wmoServices.factory('Login', ['$resource',
  function($resource){
    return $resource($REST, {}, {
      get: {method:'POST', params:{api:'login'}, headers:{'Auth':'login'}}
    });
  }]);


wmoServices.factory('Logout', ['$resource', '$window',
  function($resource, $window){
    var self = this;
    self.set =  function(sessID){
                  return $resource($REST, {}, {
                    get: {method:'POST', params:{api:'logout'}, headers:{'Auth': sessID}},
                  });
                };
    return {
      get: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.get(data, fn);
      }      
    }
  }]);


wmoServices.factory('OperatePlan', ['$resource','$window',
  function($resource, $window){
    var self = this;
    self.set = function(sessID){
      return $resource($REST, {}, {
        get:    {method:'POST', params:{api:'operatePlan', operand:'get'},    headers: {'Auth': sessID}},
        update: {method:'POST', params:{api:'operatePlan', operand:'update'}, headers: {'Auth': sessID}},
        create: {method:'POST', params:{api:'operatePlan', operand:'create'}, headers: {'Auth': sessID}},
        remove: {method:'POST', params:{api:'operatePlan', operand:'remove'}, headers: {'Auth': sessID}}
      });              
    }
    return {
      get: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.get(data, fn);
      },
      update: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.update(data, fn);
      },
      create: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.create(data, fn);
      },
      remove: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.remove(data, fn);
      }
    }
  }]);


wmoServices.factory('Registration', ['$window',
function($window){
  return {
    mailDenied: function(){
      return ($window.sessionStorage.getItem('email') || '').length === 0;
    },
    mailConfirmed: function(){
      return ($window.sessionStorage.getItem('email') || '').length > 0;
    },
  };
}]);


wmoServices.factory('Validate', ['$resource','$window',
  function($resource, $window){
    var self = this;
    self.set =  function(sessID){
                  return $resource($REST, {}, {
                    get: {method:'POST', params:{api:'validate'}, headers:{'Auth': sessID}},
                  });
                };
    return {
      get: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.get(data, fn);
      }      
    }
  }]);


wmoServices.factory('ValidateByPassword', ['$uibModal',
  function($uibModal){
    var self = this;
    
    self.factory = {
      validate: function(headerStr, cancelStr, fnOK, fnCancel){ // Header-string, Cancel-string, OK-callback, Cancel-callback
        var fnOK = fnOK || function(){}
          , fnCancel = fnCancel || function(){}
          , modal = $uibModal.open({
              animation: true,
              keyboard: true,
              backdrop: 'static', //'true' 'false', or 'static'
              templateUrl: $TMPL + 'validateByPassword.html',
              controller: 'ModalValidateByPasswordCtrl',
              size: 'sm', //'sm' - small; 'md' - medium; 'lg' - large
              resolve: {
                modalHeader: function(){
                  return headerStr || 'sessionExpired';
                },
                modalCancel: function(){
                  return cancelStr || 'cancel';
                }
              }
            })
          ;
        modal.result.then(
          function(){fnOK()}, // 'fnOK' - run callback;
          function(){fnCancel()}// 'fnCancel' - run callback
        );
      },
      response: function(statusStr, headerStr, fnOK){ // Status-string: 'success' or 'failure', Header-string, OK-callback
        var fnOK = fnOK || function(){}
          , statusStr = statusStr || 'success'
          , headerStr = headerStr || 'operationSuccess'
          , modal = $uibModal.open({
              animation: true,
              keyboard: true,
              backdrop: 'static', //'true' 'false', or 'static'
              templateUrl: $TMPL + 'operationResponse.html',
              controller: 'ModalOperationResponseCtrl',
              size: 'sm', //'sm' - small; 'md' - medium; 'lg' - large
              resolve: {
                modalHeader: function(){
                  return headerStr;
                },
                modalStatus: function(){
                  return statusStr;
                }
              }
            })
          ;
        modal.result.then(
          function(){fnOK()}, // 'fnOK' - run callback;
          function(){fnOK()}
        );
      }      
    };   
    return self.factory;
  }]);

