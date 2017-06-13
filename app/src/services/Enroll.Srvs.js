wmoServices.factory('Enroll', ['$resource',
  function($resource){
    return $resource($REST, {}, {
      get: {method:'POST', params:{api:'enroll'}, headers:{'Auth':'enroll'}}
    });
  }]);

