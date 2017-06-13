/*  Global Variables */

//var $HREF = $HREF || 'http://localhost:3000';
//var $REST = $HREF + '/rest/:api'
//  , $TMPL = $HREF + '#/templates/'

var $REST = 'rest/:api'
  , $TMPL = 'templates/'
  , $UHTMPL = $TMPL + 'uh/'
  , $TESTS = 'tests/templates/'
  , $REGISTER = 'register/'
  , $LOGIN = 'login/'
  , $LOGOUT = 'logout/'
  , $USERS = 'users/'
  , $START = '0'
  , passwdValidateRE = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-=!@#$%+]).{6,}/
  , phoneNumberValidateRE = /\d{9,}/
  ;

var $COUNTRIES = {"israel":{"currency":{"value":"ils","name":"israeliShekel","sign":"₪"},"bankList":["bankyahavforgovernmentemployeesltd","bankleumileisraelltd","israeldiscountbankltd","bankhapoalimltd","unionbankofisraelltd","bankotsarhahayalltd","mercantilediscountbankltd","mizrahitefahotbankltd","tradebankltd","thefirstinternationalbankofisraelltd","bankmassadltd","bankofjerusalemltd","dexiaisraelbankltd","postalbankofisrael"],"countryCode":"+972-(0)-","phoneExample":"545112233","cityList":["acre","afula","arad","ariel","ashdod","ashkelon","baqaalgharbiyye","batyam","beersheva","beitshean","beitshemesh","beitarillit","bneibrak","dimona","eilat","elad","givatshmuel","givatayim","hadera","haifa","herzliya","hodhasharon","holon","jerusalem","kfarqasim","karmiel","kfarsaba","kfaryona","kiryatata","kiryatbialik","kiryatgat","kiryatmalakhi","kiryatmotzkin","kiryatono","kiryatshmona","kiryatyam","lod","maaleadumim","maalottarshiha","migdalhaemek","modiinillit","modiinmaccabimreut","nahariya","nazareth","nazarethillita","nesher","nesszionaa","netanya","netivot","ofakim","orakiva","oryehuda","petahtikva","qalansawe","raanana","rahat","ramatgan","ramathasharon","ramla","rehovot","rishonlezion","roshhaayin","safed","sakhnin","sderot","shefaamr","tamra","tayibe","telaviv","tiberias","tira","tiratcarmel","ummalfahm","yavne","yehud","yokneam"]},"france":{"currency":{"value":"eur","name":"euro","sign":"€"},"bankList":["bnpbank","lclbank"],"countryCode":"+33-(0)-","phoneExample":"509112233","cityList":["paris","lyon"]}};

var $ROLELIST = ["groupAdmin","businessAdmin","officeAdmin","globalAdmin"];

var $USERSTATUSLIST = ["active","inactive","locked","expelled"];

var $PLANPROPERTIES = {"planDateFormat":"dd/MM/yyyy","pendingStartPeriod":3,"pendingFinishPeriod":7,"minActivePeriod":28,"maxPlanPercentage":100,"maxPlanDuration":12};
