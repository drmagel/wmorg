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
