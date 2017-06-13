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

