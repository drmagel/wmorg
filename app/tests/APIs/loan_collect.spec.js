/**
* Test description:
* o Preparation:
*   - Create 2 users, one is a GlobalAdmin, second one is BusinessAdmin
*   - Create a plan
* o Test bed:
*   - Create 2 applications: LOAN and COLLECT
*   - Create 2 pendants
*   - Reject 1 offer (pendant)
*   - Accept 1 offer (pendant)
*   - Create transaction from the pendant
*   - Accept transaction
* o Cleaning
*   - Remove applications
*   - Remove users
*   - Remove the plan
* 
* o 
*   - 
* 
**/
// LDAP
var LDAP = require('ldap-client')
  , connect = require('config').ldap.connect
  , ldapClient = new LDAP(connect)
  , ldap = require('ldap');
ldap.init(ldapClient);

// DB
var session = require('models')('sessions')
  , users = require('models')('users')
  , applications = require('models')('applications')
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
  , createdPlans = []
;


// Test values

var KP = {
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

  , GenaAlter = {
      firstName:  'Gena',
      familyName: 'Alter',
      phone: '545433666',
      email: 'gaga@v30.amdocs.com',
      currency: 'ils',
      country: 'israel',
      city: 'kfarsaba',
      language: 'eng',
      bankAccount: [{ name: 'bankleumileisraelltd',
                      site: '900',
                      account: '234234/88',
                      accountOwner: 'Gena Alter'
                    },
                    {name: 'bankhapoalimltd',
                      site: '400',
                      account: '345612345',
                      accountOwner: 'Gena Alter'
                    },
                    {name: 'israeldiscountbankltd',
                      site: '3455',
                      account: '34-543645',
                      accountOwner: 'Gena Alter'
                    }]
      
    }
;

function getTime(num){
  var d = new Date()
  return new Date(d.setMonth(num)).getTime();
}

var d = new Date()
  , month = d.getMonth()
  , today = d.getDate()
  , tomorrow = new Date(d.setDate(today + 1)).getTime()
  
  , loanApp = {
      type: 'loan',
      amount: 300
    }
  , collectApp = {
      type: 'collect',
      amount: 200
    }

  , planLCT = { // Permanent
      description: {'eng': 'Loan - Collect Test','rus': 'Loan - Collect Test','heb': 'Loan - Collect Test'}, // Langs and descriptions can be edited via GUI
      duration: 3, // months
      interest: 30, // procents
      fromDate: getTime(month - 2), // start of active period or Date(01/01/2016)
      tillDate: 'permanent' // end of active period or 'permanent'
    }
    
  , loan
  ;
//
// Creating initial test components
//
describe("REST API:", function(){
  it("is there a DB server running", function(next) {
    MongoClient.connect(dbURI, function(e,db) {
      expect(e).toBe(null);
      expect(db).toBeDefined();
      DB = db;   // Setting the real DB
      users.setDB(DB);
      session.setDB(DB);
      applications.setDB(DB);
      enrolls.setDB(DB);
      next();
    });
  });
  it("ENROLL: check the e-mail and respond with strings", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var json = {'operand': 'checkEmail',
                'email': KP.email,
                'lang': KP.lang
               }
      , req = request(post, function(res){
//console.log(res);
          enrolls.bring(KP.email, function(e,r){
            expect(e).toBe(null);
//console.log(r);
            expect(r).not.toBe(null);
            KP.string = r.string;
            KP.number = r.number;
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("createUser: Create new user Kimi Put", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var json = {'email': KP.email,
                'password': KP.password,
                'string': KP.string,
                'number': KP.number,
                'user': KimiPut
               }
      , req = request(post, function(res){
//console.log(res);
      expect(res.result).toBe(true);
      expect(res.sessID).not.toBe(null);
      expect(res.userID).not.toBe(null);
      KP.userID = res.userID;
      KP.sessID = res.sessID;
      next();
    });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("VALIDATE: should approve by user and password", function(next){
    post.path = '/rest/validate';
    post.headers['Auth'] = KP.sessID;   
    var json = {'email': KP.email,
                'password': KP.password,
                'sessID': KP.sessID
               }
      , req = request(post, function(res){
//console.log(res);
      expect(res.result).toBe(true);
      expect(res.userID).toEqual(KP.userID);
      expect(res.sessID).toEqual(KP.sessID);
      next();
    });
    req.write(JSON.stringify(json));
    req.end();
  });  
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
  it("createUser: Create Gena Alter", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var json = {'email': GA.email,
                'password': GA.password,
                'string': GA.string,
                'string': GA.string,
                'number': GA.number,
                'user': GenaAlter
               }
      , req = request(post, function(res){
//console.log(res);
      expect(res.result).toBe(true);
      expect(res.sessID).not.toBe(null);
      expect(res.userID).not.toBe(null);
      GA.userID = res.userID;
      GA.sessID = res.sessID;
      // manually make it Global Admin
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
  it("UPDATE User Role: add businessAdmin role to userID", function(next){
    post.path = '/rest/updateUserRole';
    post.headers['Auth'] = GA.sessID;
    var json = {'data': {'userID': KP.userID,
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
  it("CREATE one plan: Create one plan (object) using 'create'", function(next){
    var plan = planLCT;
    post.path = '/rest/operatePlan';
    post.headers['Auth'] = KP.sessID;
    var json = {'plan': plan,
                'operand': 'create',
                'userID': KP.userID,
                'sessID': KP.sessID
               }
      , req = request(post, function(res){
          plan.planID = res.plan.planID;
          planLCT = plan;
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

//
// Testbed - testing the Applications APIs
//

  it("CREATE loan application: from loanApp object", function(next){
    var plan = planLCT;
    post.path = '/rest/operateApplication';
    post.headers['Auth'] = KP.sessID;
    var json = {'operand': 'create',
                'planID': plan.planID,
                'type':   loanApp.type,
                'amount': loanApp.amount,
                'userID': KP.userID,
                'sessID': KP.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.sessID).toEqual(KP.sessID);
          expect(res.application.userID).toEqual(KP.userID);
          expect(res.application.amount).toEqual(loanApp.amount);
          expect(res.application.type).toEqual(loanApp.type);
          expect(res.application.plan.planID).toEqual(planLCT.planID);
          
          loanApp = res.application;
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });

  it("CREATE collect application: from collectApp object", function(next){
    post.path = '/rest/operateApplication';
    post.headers['Auth'] = KP.sessID;
    var json = {'operand': 'create',
                'type':   collectApp.type,
                'amount': collectApp.amount,
                'userID': KP.userID,
                'sessID': KP.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.sessID).toEqual(KP.sessID);
          expect(res.application.userID).toEqual(KP.userID);
          expect(res.application.amount).toEqual(collectApp.amount);
          expect(res.application.type).toEqual(collectApp.type);
          
          collectApp = res.application;
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });




//
// Removing test objects from the system
//
  it("Remove loan application from the system", function(next){
    applications.remove(loanApp.appID, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 1 });
      next();
    })
  });
  it("Remove collect application from the system", function(next){
    applications.remove(collectApp.appID, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 1 });
      next();
    })
  });
  it("Remove plan from the system", function(next){
    var plan = planLCT;
    post.path = '/rest/operatePlan?operand=remove';
    post.headers['Auth'] = KP.sessID   
    var json = {'planID': plan.planID,
                'userID': KP.userID,
                'sessID': KP.sessID
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
    post.headers['Auth'] = KP.sessID;
    var json = {'': ,
                '': ,  
                'sessID': KP.sessID
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
    ldap.remove(KP.email, function(e,r){
      expect(r).toBe(true);
      users.remove(KP.userID, function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, n: 1 });
        session.remove(KP.sessID, function(e,r){
          expect(e).toBe(null);
          expect(r.result).toEqual({ ok: 1, n: 1 });
          next();
        });
      });
    });
  });

  it("Remove Gena Alter from the system", function(next){
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
