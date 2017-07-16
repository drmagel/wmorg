// LDAP
var LDAP = require('ldap-client')
  , connect = require('config').ldap.connect
  , ldapClient = new LDAP(connect)
  , ldap = require('ldap');
ldap.init(ldapClient);

// DB
var session = require('models')('sessions')
  , users = require('models')('users')
  , count = require('models')('counters')
  , enrolls = require('models')('enrolls')
  , MongoClient = require('mongodb').MongoClient
  , mongo = require('config').mongo
  , DB = {};
  
var dbURI = 'mongodb://' +
    mongo.dbuser +
    ':' +
    mongo.dbpass +
    '@' +
    mongo.host +
    ':' +
    mongo.port +
    '/' + mongo.dbname;

//HTTP
var port = require('config').server.port
  , http = require('http')
  , post = {
      host: '127.0.0.1',
      port: port,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    }
  , request = function(post, fn){
      return http.request(post, function(res){
        var str = '';
        res.on('data', function(chunk){str += chunk;});
        res.on('end', function(){fn(JSON.parse(str))});
      });
    }
;


// Test values
var FE = {
      lang: 'rus',
      email: 'kuku@v30.amdocs.com',
      password: '1234'
    }

  , KimiPut = {
      firstName:  'Кими',
      familyName: 'Пут',
      phone: '545433554',
      email: 'kuku@v30.amdocs.com',
      currency: 'ils',
      country: 'israel',
      city: 'telaviv',
      language: 'rus',
      bankAccount: [{ name: 'bankleumileisraelltd',
                      site: '900',
                      account: '234234/88',
                      accountOwner: 'קימי פוט'
                    },
                    {name: 'bankhapoalimltd',
                      site: '400',
                      account: '345612345',
                      accountOwner: 'קימי פוט'
                    },
                    {name: 'israeldiscountbankltd',
                      site: '3455',
                      account: '34-543645',
                      accountOwner: 'קימי פוט'
                    }]
    }

  , GA = {
      lang: 'eng',
      email: 'gaga@v30.amdocs.com',
      password: '1234'
    }

  , GlobalAdmin = {
      firstName:  'Global',
      familyName: 'Admin',
      phone: '545433666',
      email: 'gaga@v30.amdocs.com',
      currency: 'ils',
      country: 'israel',
      city: 'kfarsaba',
      language: 'eng',
      bankAccount: [{ name: 'bankleumileisraelltd',
                      site: '900',
                      account: '234234/88',
                      accountOwner: 'Global Admin'
                    },
                    {name: 'bankhapoalimltd',
                      site: '400',
                      account: '345612345',
                      accountOwner: 'Global Admin'
                    },
                    {name: 'israeldiscountbankltd',
                      site: '3455',
                      account: '34-543645',
                      accountOwner: 'Global Admin'
                    }]
      
    }
;

function getTime(num){
  var d = new Date()
  return new Date(d.setMonth(num)).getTime();
}

function filterPlans(plan, list){
  return list.filter(function(el){return plan.planID === el.planID}).length > 0;
}

var d = new Date()
  , month = d.getMonth()
  , today = d.getDate()
  , tomorrow = new Date(d.setDate(today + 1)).getTime()

  , plan01 = { // Permanent
      description: {'eng': 'Permanent','rus': 'Permanent','heb': 'Permanent'}, // Langs and descriptions can be edited via GUI
      duration: 3, // months
      interest: 30, // procents
      fromDate: getTime(month - 1), // start of active period or Date(01/01/2016)
      tillDate: 'permanent' // end of active period or 'permanent'
    }
  
 ,  plan02 = { // From last month till the next
      description: {'eng': 'Two months','rus': 'Two months','heb': 'Two months'}, // Langs and descriptions can be edited via GUI
      duration: 1, // months
      interest: 10, // procents
      fromDate: getTime(month - 1), // start of active period or Date(01/01/2016)
      tillDate: getTime(month + 1) // end of active period or 'permanent'
    }
  
  , plan03 = { // Pending
      description: {'eng': 'Pending','rus': 'Pending','heb': 'Pending'}, // Langs and descriptions can be edited via GUI
      duration: 1, // months
      interest: 10, // procents
      fromDate: getTime(month + 1), // start of active period or Date(01/01/2016)
      tillDate: getTime(month + 2) // end of active period or 'permanent'
    }
  
  , plan04 = { // Completed
      description: {'eng': 'Completed','rus': 'Completed','heb': 'Completed'}, // Langs and descriptions can be edited via GUI
      duration: 1, // months
      interest: 10, // procents
      fromDate: getTime(month - 2), // start of active period or Date(01/01/2016)
      tillDate: getTime(month - 1) // end of active period or 'permanent'
    }
    , planList = [plan02, plan03, plan04]
    , createdPlans = []
    , plansForUpdate = function(){
        return createdPlans.filter(function(pl){
          return (Number.isInteger(pl.tillDate) &&
                  (pl.tillDate > tomorrow)
                 );
        });
      }
    ;


// Testing the configuration file
describe("REST API:", function(){
  it("is there a DB server running", function(next) {
    MongoClient.connect(dbURI, function(e,db) {
      expect(e).toBe(null);
      expect(db).toBeDefined();
      DB = db;   // Setting the real DB
      users.setDB(DB);
      session.setDB(DB);
      count.setDB(DB);
      enrolls.setDB(DB);
      next();
    });
  });

  it("ENROLL: check the non-existent e-mail and respond with false", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var json = {'operand': 'checkEmail',
                'email': "kukuNonExistent@v30.amdocs.com",
                'lang': FE.lang}
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(false);
          expect(res.reason).toMatch(/non_existent_email/);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("ENROLL: check the e-mail and respond with TRUE", function(next){
    post.path = '/rest/enroll?operand=checkEmail';
    post.headers['Auth'] = 'enroll';   
    var json = {'email': FE.email,
                'lang': FE.lang
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("REASSERT: get verification string and number", function(next){
    post.path = '/rest/enroll?operand=reassert';
    post.headers['Auth'] = 'enroll';  
    enrolls.bring(FE.email, function(e,r){
      expect(e).toBe(null);
//console.log(r);
      expect(r).not.toBe(null);
      FE.string = r.string;
      FE.number = r.number;
      var json = {'email': FE.email,
                  'number': FE.number,
                  'string': FE.string
                 }
      , req = request(post, function(res){  
//console.log(res);
          expect(res.result).toBe(true);
          next();
        });
      req.write(JSON.stringify(json));
      req.end();
    });
  });
  it("createUser: Create new user Kimi Put", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var json = {'email': FE.email,
                'number': FE.number,
                'string': FE.string,
                'password': FE.password,
                'user': KimiPut
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.sessID).not.toBe(null);
          expect(res.userID).not.toBe(null);
          FE.userID = res.userID;
          FE.sessID = res.sessID;
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("ENROLL: check the existing e-mail and respond with false", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var json = {'operand': 'checkEmail',
                'email': FE.email,
                'lang': FE.lang}
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(false);
          expect(res.email).toEqual(FE.email);
          expect(res.reason).toMatch(/email_already_exists/);
          expect(res.userStatus).not.toBe(null)
          expect(Number(res.groupAdminUserID)).toEqual(jasmine.any(Number));
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
    it("ENROLL: check the existing phone number and respond with false", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var json = {'operand': 'checkPhone',
                'phone': KimiPut.phone,
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(false);
          expect(res.phone).toEqual(KimiPut.phone);
          expect(res.reason).toMatch(/phone_already_exists/);
          expect(res.userStatus).not.toBe(null)
          expect(Number(res.groupAdminUserID)).toEqual(jasmine.any(Number));
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("LOGOUT: remove the session", function(next){
    post.path = '/rest/logout';
    post.headers['Auth'] = FE.sessID;
    var json = {'sessID': FE.sessID}
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          FE.user = {};
          FE.userID = 0;
          FE.sessID = '';
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("LOGIN: should check the login procedure", function(next){
    post.path = '/rest/login';
    post.headers['Auth'] = 'login'
    var json = {'email': FE.email,
                'password': FE.password
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          FE.userID = res.userID;
          FE.sessID = res.sessID;
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("GET User: should bring user by userID", function(next){
    post.path = '/rest/operateUser?operand=get';
    post.headers['Auth'] = FE.sessID;
    var json = {'userID': FE.userID,
                'sessID': FE.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.user).not.toBe(null);
          FE.user = res.user;
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("VALIDATE: should approve by user and password", function(next){
    post.path = '/rest/validate';
    post.headers['Auth'] = FE.sessID;   
    var json = {'email': FE.email,
                'password': FE.password,
                'sessID': FE.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.userID).toEqual(FE.userID);
          expect(res.sessID).toEqual(FE.sessID);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });


// operatePlan - session and user permission validation
  it("CREATE one plan: Create one plan with wrong sessID", function(next){
    var plan = plan01
      , wrong_sessID = '622b5770ba5ff01c731613787501fc5949c4a841caba4034b89618fa75fd8335'
      ;
    post.path = '/rest/operatePlan';
    post.headers['Auth'] = wrong_sessID;
    var json = {'plan': plan,
                'operand': 'create',
                'userID': FE.userID,
                'sessID': wrong_sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(false);
          expect(res.reason).toEqual('invalid_sessid');
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("CREATE one plan: Create one plan with wrong userID", function(next){
    var plan = plan01
      , wrong_userID = 100000000703
      ;
    post.path = '/rest/operatePlan';
    post.headers['Auth'] = FE.sessID;
    var json = {'plan': plan,
                'operand': 'create',
                'userID': wrong_userID,
                'sessID': FE.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(false);
          expect(res.reason).toEqual('invalid_sessid');
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("CREATE one plan: Create one plan when sessID is expired", function(next){
//24
    session.getInvalidSess(function(e,r){
      expect(e).toBe(null);
      if(r.length > 0){
        var ES = r[0];
        var plan = plan01;
        post.path = '/rest/operatePlan';
        post.headers['Auth'] = ES.sessID;
        var json = {'plan': plan,
                    'operand': 'create',
                    'userID': ES.userID,
                    'sessID': ES.sessID
                   }
          , req = request(post, function(res){
//console.log(res);
              expect(res.result).toBe(false);
              expect(res.reason).toEqual('sessid_expired');
              next();
            });
        req.write(JSON.stringify(json));
        req.end();
      } else { // No expired sessions in DB
        next();
      };
    }); // session.getInvalidSess
  });
  it("CREATE one plan: Create one plan with wrong user permissions", function(next){
    var plan = plan01;
    post.path = '/rest/operatePlan';
    post.headers['Auth'] = FE.sessID;
    var json = {'plan': plan,
                'operand': 'create',
                'userID': FE.userID,
                'sessID': FE.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(false);
          expect(res.reason).toEqual('permission_denied');
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });


// User Role
  it("ENROLL: check the e-mail and respond with strings", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var json = {'operand': 'checkEmail',
                'email': GA.email,
                'lang': GA.lang
               }
      , req = request(post, function(res){
//console.log(res);
          enrolls.bring(GA.email, function(e,r){
            expect(e).toBe(null);
//console.log(r);
            expect(r).not.toBe(null);
            GA.string = r.string;
            GA.number = r.number;
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("createUser: Create Global Admin", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var json = {'email': GA.email,
                'password': GA.password,
                'string': GA.string,
                'number': GA.number,
                'user': GlobalAdmin
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.sessID).not.toBe(null);
          expect(res.userID).not.toBe(null);
          GA.userID = res.userID;
          GA.sessID = res.sessID;
          users.updateUserRole(GA.userID, ['globalAdmin'], function(e,r){
            expect(e).toBe(null);
            expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
//console.log(r);
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });

  it("UPDATE User Role: check missed userID", function(next){
    post.path = '/rest/updateUserRole';
    post.headers['Auth'] = GA.sessID;
    var json = {'data': {'userRole': ['businessAdmin']},
                'userID': GA.userID,
                'sessID': GA.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(false);
          expect(res.reason).toEqual('invalid_parameters');
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("UPDATE User Role: add businessAdmin role to userID", function(next){
    post.path = '/rest/updateUserRole';
    post.headers['Auth'] = GA.sessID;
    var json = {'data': {'userID': FE.userID,
                         'userRole': ['businessAdmin']
                        },
                'userID': GA.userID,
                'sessID': GA.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("operateUser: updateUserRating: test expired session", function(next){
    session.getInvalidSess(function(e,r){
      expect(e).toBe(null);
      if(r.length > 0){
        var ES = r[0];
        post.path = '/rest/operateUser';
        post.headers['Auth'] = ES.sessID;
        var json = {'data': {'userID': FE.userID,
                             'score': 3
                            },
                    'operand': 'updateUserRating',
                    'userID': ES.userID,
                    'sessID': ES.sessID
                   }
          , req = request(post, function(res){
//console.log(res);
              expect(res.result).toBe(false);
              expect(res.sessID).toEqual(ES.sessID);
              expect(res.reason).toEqual('sessid_expired');
              next();
            });
        req.write(JSON.stringify(json));
        req.end();
      } else { // No expired sessions in DB
        next();
      };
    }); // session.getInvalidSess
  });
  it("operateUser: updateUserRating: check missing data.userID", function(next){
    post.path = '/rest/operateUser';
    post.headers['Auth'] = GA.sessID;   
    var json = {'data': {'score': 3},
                'operand': 'updateUserRating',
                'userID': GA.userID,
                'sessID': GA.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(false);
          expect(res.sessID).toEqual(GA.sessID);
          expect(res.reason).toEqual('invalid_parameters');
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("operateUser: updateUserRating: should update userID rating increment score and evaluations", function(next){
    post.path = '/rest/operateUser?operand=updateUserRating';
    post.headers['Auth'] = GA.sessID;   
    var json = {'data': {'userID': FE.userID,
                         'score': 3
                        },
                'userID': GA.userID,
                'sessID': GA.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.sessID).toEqual(GA.sessID);
          expect(res.data.userID).toEqual(FE.userID);
          expect(res.data.userRating).toEqual({ score: 3, evaluations: 1 });
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });


// operatePlan - functional tests
  it("CREATE one plan: Create one plan (object) using 'create'", function(next){
    var plan = plan01;
    post.path = '/rest/operatePlan';
    post.headers['Auth'] = FE.sessID;
    var json = {'plan': plan,
                'operand': 'create',
                'userID': FE.userID,
                'sessID': FE.sessID
               }
      , req = request(post, function(res){
          plan.planID = res.plan.planID;
          createdPlans.push(plan);
          expect(res.result).toBe(true);
          expect(res.plan.duration).toEqual(plan.duration);
          expect(res.plan.interest).toEqual(plan.interest);
          expect(res.plan.fromDate).toEqual(plan.fromDate);
          expect(res.plan.tillDate).toEqual(plan.tillDate);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("CREATE PLANS: Create list of plans using 'create'", function(next){
    post.path = '/rest/operatePlan?operand=create';
    post.headers['Auth'] = FE.sessID   
    var json = {'plan': planList,
                'userID': FE.userID,
                'sessID': FE.sessID
               }
      , req = request(post, function(res){
//console.log(planList);
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.plan.length).toEqual(planList.length);
          createdPlans = createdPlans.concat(res.plan);
//console.log(createdPlans);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("GET Plan: get a plan", function(next){
    var plan = createdPlans[0];
    post.path = '/rest/operatePlan?operand=get';
    post.headers['Auth'] = FE.sessID   
    var json = {'planID': plan.planID,
                'userID': FE.userID,
                'sessID': FE.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.planID).toEqual(plan.planID);
          expect(res.plan.duration).toEqual(plan.duration);
          expect(res.plan.interest).toEqual(plan.interest);
          expect(res.plan.fromDate).toEqual(plan.fromDate);
          expect(res.plan.tillDate).toEqual(plan.tillDate);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("UPDATE plan: set some new values", function(next){
    var plan = plansForUpdate()[1];
    plan.interest = 60;
    plan.duration = 6;
    plan.tillDate = getTime(month + 6);
    post.path = '/rest/operatePlan?operand=update';
    post.headers['Auth'] = FE.sessID   
    var json = { 'plan': plan,
                'userID': FE.userID,
                'sessID': FE.sessID
               }
      , req = request(post, function(res){
//console.log(res);
//console.log(new Date(res.plan.tillDate));
          expect(res.result).toBe(true);
          expect(res.plan.planID).toEqual(plan.planID);
          expect(res.plan.duration).toEqual(plan.duration);
          expect(res.plan.interest).toEqual(plan.interest);
          expect(res.plan.fromDate).toEqual(plan.fromDate);
          expect(res.plan.tillDate).toEqual(plan.tillDate);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("UPDATE plans: set some new values into list of plans", function(next){
    var plan = plansForUpdate();
    plan[0].tillDate = getTime(month + 6);
    plan[1].interest = 50;
    plan[1].duration = 3;
    post.path = '/rest/operatePlan';
    post.headers['Auth'] = FE.sessID   
    var json = {'plan': plan,
                'operand': 'update',
                'userID': FE.userID,
                'sessID': FE.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.plan.length).toEqual(plan.length);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });

// getPalns - session validation
  it("Get Active Plans: invalid sessID", function(next){
    var wrong_sessID = '622b5770ba5ff01c731613787501fc5949c4a841caba4034b89618fa75fd8335';
    post.path = '/rest/getPlans?operand=active';
    post.headers['Auth'] = wrong_sessID;
    var json = {'userID': FE.userID,
                'sessID': wrong_sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(false);
          expect(res.reason).toEqual('invalid_sessid');
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("Get Active Plans: expired sessID", function(next){
    session.getInvalidSess(function(e,r){
      expect(e).toBe(null);
      if(r.length > 0){
        var ES = r[0];
        post.path = '/rest/getPlans';
        post.headers['Auth'] = ES.sessID;
        var json = {'operand': 'active',
                    'userID': ES.userID,
                    'sessID': ES.sessID
                   }
          , req = request(post, function(res){
//console.log(res);
              expect(res.result).toBe(false);
              expect(res.reason).toEqual('sessid_expired');
              next();
            });
        req.write(JSON.stringify(json));
        req.end();
      } else { // No expired sessions in DB
        next();
      };
    }); // session.getInvalidSess
  });

// getPalns - functional
  it("Get Active Plans: default operand", function(next){
    post.path = '/rest/getPlans';
    post.headers['Auth'] = FE.sessID;
    var json = {'userID': FE.userID, 'sessID': FE.sessID}
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.plans.filter(function(el){return filterPlans(el, createdPlans);}).length).toEqual(2);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("Get Active Plans", function(next){
    post.path = '/rest/getPlans?operand=active';
    post.headers['Auth'] = FE.sessID;
    var json = {'userID': FE.userID, 'sessID': FE.sessID}
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.plans.filter(function(el){return filterPlans(el, createdPlans);}).length).toEqual(2);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("Get Permanent Plans", function(next){
    post.path = '/rest/getPlans';
    post.headers['Auth'] = FE.sessID   
    var json = {'userID': FE.userID, 'sessID': FE.sessID, 'operand': 'permanent'}
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.plans.filter(function(el){return filterPlans(el, createdPlans);}).length).toEqual(1);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("Get Pending Plans", function(next){
    post.path = '/rest/getPlans?operand=pending';
    post.headers['Auth'] = FE.sessID   
    var json = {'userID': FE.userID, 'sessID': FE.sessID}
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.plans.filter(function(el){return filterPlans(el, createdPlans);}).length).toEqual(1);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("Get Completed Plans", function(next){
    post.path = '/rest/getPlans?operand=completed';
    post.headers['Auth'] = FE.sessID   
    var json = {'userID': FE.userID, 'sessID': FE.sessID}
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.plans.filter(function(el){return filterPlans(el, createdPlans);}).length).toEqual(1);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });

// operatePlan: remove plans
  it("Remove plan from the system", function(next){
    var plan = createdPlans.shift();
    post.path = '/rest/operatePlan?operand=remove';
    post.headers['Auth'] = FE.sessID   
    var json = {'planID': plan.planID,
                'userID': FE.userID,
                'sessID': FE.sessID
               }
      , req = request(post, function(res){
//console.log(res);
      next();
    });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("Remove plans list from the system", function(next){
    var planIDList = [];
    createdPlans.forEach(function(pln){planIDList.push(pln.planID)});
    post.path = '/rest/operatePlan';
    post.headers['Auth'] = FE.sessID   
    var json = {'planID': planIDList,
                'operand': 'remove',
                'userID': FE.userID,
                'sessID': FE.sessID
               }
      , req = request(post, function(res){
//console.log(res);
      next();
    });
    req.write(JSON.stringify(json));
    req.end();
  });
  
/*
  it(": ", function(next){
    post.path = '/rest/';
    post.headers['Auth'] = FE.sessID;
    var json = {'': ,
                '': ,  
                'sessID': FE.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
15 */

  it("Remove Kimi Put from the system", function(next){
    ldap.remove(FE.email, function(e,r){
      expect(r).toBe(true);
      users.remove(FE.userID, function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, n: 1 });
        session.remove(FE.sessID, function(e,r){
          expect(e).toBe(null);
          expect(r.result).toEqual({ ok: 1, n: 1 });
          next();
        });
      });
    });
  });

  it("Remove Global Admin from the system", function(next){
    ldap.remove(GA.email, function(e,r){
      expect(r).toBe(true);
      users.remove(GA.userID, function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, n: 1 });
        session.remove(GA.sessID, function(e,r){
          expect(e).toBe(null);
          expect(r.result).toEqual({ ok: 1, n: 1 });
          next();
        });
      });
    });
  });

  it('closing the DB and LDAP connections', function(next){
    ldap.close();
    DB.close();
    next();
  });
});
