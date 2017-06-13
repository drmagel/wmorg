wmoServices.factory('CreateUser', ['$resource',
  function($resource){
    return $resource($REST, {}, {
      get: {method:'POST', params:{api:'createUser'}, headers:{'Auth':'createuser'}}
      });
  }]);

