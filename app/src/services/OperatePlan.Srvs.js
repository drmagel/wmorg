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

