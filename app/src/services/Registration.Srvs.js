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

