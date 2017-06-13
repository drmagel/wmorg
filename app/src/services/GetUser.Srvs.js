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

