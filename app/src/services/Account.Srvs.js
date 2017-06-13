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


