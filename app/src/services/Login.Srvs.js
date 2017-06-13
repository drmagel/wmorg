wmoServices.factory('Login', ['$resource',
  function($resource){
    return $resource($REST, {}, {
      get: {method:'POST', params:{api:'login'}, headers:{'Auth':'login'}}
    });
  }]);

