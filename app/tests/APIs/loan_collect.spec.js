/**
* Test description:
* o Preparation:
*   - Create 4 users, one is a GlobalAdmin, second one is BusinessAdmin
*   - Create a plan
* o Test bed:
*   - Greate 1 LOAN application
*   - Create 2 COLLECT applications

****** Pendants ******
*   - Create an offer (pendant) from COLLECT to LOAN
*   - Get user's orrers.
*   - Get assigned offers.
*   - Decline the offer.
*   - Remove the  offer.
*   - Create an offer (pendant) from COLLECT to LOAN
*   - Accept the offer
*   - Cancel the offer
*   - Create an offer (pendant) from LOAN to COLLECT
*   - Get assigned offers.
*   - Decline the offer.
*   - Remove the offer.
*   - Create an offer (pendant) from LOAN to COLLECT
*   - Get user's offers.
*   - Cancel the offer.
*   - Create an offer (pendant) from LOAN to COLLECT
*   - Accept the offer

***** Transactions ******
*   - Create transaction.
*   - Close the transaction && create the asset value.
*   - Cancel the LOAN && create and ASSET record.
*   - Create an offer from LOAN to COLLECT
*   - Decline the offer
*   - Create an offer from LOAN to COLLECT
*   - Accept the offer && create transaction
*   - Admin (Office, Global) cancel the transaction
*   - LOAN offers 2 COLLECTS
*   - Accept offers and create transactions
*   - Close transactions and create ASSETs
*   - Create COLLECT from ASSETs
*   - 
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
  , pendants = require('models')('pendants')
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
  
  , GL = {
      lang: 'heb',
      email: 'lglg@v30.amdocs.com',
      password: '1234'
    }

  , GoshaLummer = {
      firstName:  'גושה',
      familyName: 'לומר',
      phone: '545433688',
      email: 'lglg@v30.amdocs.com',
      currency: 'ils',
      country: 'israel',
      city: 'roshain',
      language: 'heb',
      bankAccount: [{ name: 'bankleumileisraelltd',
                      site: '910',
                      account: '234243/88',
                      accountOwner: 'גושה לומר'
                    },
                    {name: 'bankhapoalimltd',
                      site: '40',
                      account: '345612443',
                      accountOwner: 'גושה לומר'
                    },
                    {name: 'israeldiscountbankltd',
                      site: '34',
                      account: '34-543232',
                      accountOwner: 'גושה לומר'
                    }]
      
    }
    
  , MH = {
      lang: 'heb',
      email: 'moti@v30.amdocs.com',
      password: '1234'
    }

  , MotiHammer = {
      firstName:  'מוטי',
      familyName: 'פטיש',
      phone: '545433989',
      email: 'moti@v30.amdocs.com',
      currency: 'ils',
      country: 'israel',
      city: 'ashdod',
      language: 'heb',
      bankAccount: [{ name: 'bankleumileisraelltd',
                      site: '934',
                      account: '234978/88',
                      accountOwner: 'מוטי פטיש'
                    },
                    {name: 'bankhapoalimltd',
                      site: '456',
                      account: '345612989',
                      accountOwner: 'מוטי פטיש'
                    },
                    {name: 'israeldiscountbankltd',
                      site: '35',
                      account: '34-543567',
                      accountOwner: 'מוטי פטיש'
                    }]
      
    }
    
  , testUsers = []
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
      pendants.setDB(DB);
      next();
    });
  });

//GA - Gena Alter, the Global Admin
  it("ENROLL GA: check the e-mail and respond with strings", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var U = {S: GA}
      , json = {'operand': 'checkEmail',
                'email': U.S.email,
                'lang': U.S.lang
               }
      , req = request(post, function(res){
//console.log(res);
          enrolls.bring(U.S.email, function(e,r){
            expect(e).toBe(null);
//console.log(r);
            expect(r).not.toBe(null);
            U.S.string = r.string;
            U.S.number = r.number;
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("createUser GA: Create new user Gena Alter, the Global Admin", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var U = {S: GA, ser: GenaAlter}
      , json = {'email': U.S.email,
                'password': U.S.password,
                'string': U.S.string,
                'number': U.S.number,
                'user': U.ser
               }
      , req = request(post, function(res){
//console.log(res);
      expect(res.result).toBe(true);
      expect(res.sessID).not.toBe(null);
      expect(res.userID).not.toBe(null);
      U.S.userID = res.userID;
      U.S.sessID = res.sessID;
      testUsers.push(U.S);
      // manually assign Gena Alter (GA) the globalAdmin role
      users.updateUserRole(GA.userID, ['globalAdmin'], function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
//console.log(r);
        next();
      });
    });
    req.write(JSON.stringify(json));
    req.end();
  }); // Global Admin

//KP - Kimi Put
  it("ENROLL KP: check the e-mail and respond with strings", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var U = {S: KP}
      , json = {'operand': 'checkEmail',
                'email': U.S.email,
                'lang': U.S.lang
               }
      , req = request(post, function(res){
//console.log(res);
          enrolls.bring(U.S.email, function(e,r){
            expect(e).toBe(null);
//console.log(r);
            expect(r).not.toBe(null);
            U.S.string = r.string;
            U.S.number = r.number;
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("createUser KP: Create new user Kimi Put", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var U = {S: KP, ser: KimiPut}
      , json = {'email': U.S.email,
                'password': U.S.password,
                'string': U.S.string,
                'number': U.S.number,
                'user': U.ser
               }
      , req = request(post, function(res){
//console.log(res);
      expect(res.result).toBe(true);
      expect(res.sessID).not.toBe(null);
      expect(res.userID).not.toBe(null);
      U.S.userID = res.userID;
      U.S.sessID = res.sessID;
      testUsers.push(U.S);
      next();
    });
    req.write(JSON.stringify(json));
    req.end();
  });

// GL - Gosha Lummer
  it("ENROLL GL: check the e-mail and respond with strings", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var U = {S: GL}
      , json = {'operand': 'checkEmail',
                'email': U.S.email,
                'lang': U.S.lang
               }
      , req = request(post, function(res){
//console.log(res);
          enrolls.bring(U.S.email, function(e,r){
            expect(e).toBe(null);
//console.log(r);
            expect(r).not.toBe(null);
            U.S.string = r.string;
            U.S.number = r.number;
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("createUser GL: Create new user Gosha Lummer", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var U = {S: GL, ser: GoshaLummer}
      , json = {'email': U.S.email,
                'password': U.S.password,
                'string': U.S.string,
                'number': U.S.number,
                'user': U.ser
               }
      , req = request(post, function(res){
//console.log(res);
      expect(res.result).toBe(true);
      expect(res.sessID).not.toBe(null);
      expect(res.userID).not.toBe(null);
      U.S.userID = res.userID;
      U.S.sessID = res.sessID;
      testUsers.push(U.S);
      next();
    });
    req.write(JSON.stringify(json));
    req.end();
  });
// MH - Moti Hammer
  it("ENROLL MH: check the e-mail and respond with strings", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var U = {S: MH}
      , json = {'operand': 'checkEmail',
                'email': U.S.email,
                'lang': U.S.lang
               }
      , req = request(post, function(res){
//console.log(res);
          enrolls.bring(U.S.email, function(e,r){
            expect(e).toBe(null);
//console.log(r);
            expect(r).not.toBe(null);
            U.S.string = r.string;
            U.S.number = r.number;
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("createUser MH: Create new user Moti Hammer", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var U = {S: MH, ser: MotiHammer}
      , json = {'email': U.S.email,
                'password': U.S.password,
                'string': U.S.string,
                'number': U.S.number,
                'user': U.ser
               }
      , req = request(post, function(res){
//console.log(res);
      expect(res.result).toBe(true);
      expect(res.sessID).not.toBe(null);
      expect(res.userID).not.toBe(null);
      U.S.userID = res.userID;
      U.S.sessID = res.sessID;
      testUsers.push(U.S);
      next();
    });
    req.write(JSON.stringify(json));
    req.end();
  });

  it("UPDATE User Role: add businessAdmin role to Kimi Put", function(next){
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

// Applications
  it("CREATE loan application: from loanApp object (Gena Alter)", function(next){
    var plan = planLCT;
    post.path = '/rest/operateApplication';
    post.headers['Auth'] = GA.sessID;
    var json = {'operand': 'create',
                'planID': plan.planID,
                'type':   loanApp.type,
                'amount': loanApp.amount,
                'userID': GA.userID,
                'sessID': GA.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.sessID).toEqual(GA.sessID);
          expect(res.application.userID).toEqual(GA.userID);
          expect(res.application.amount).toEqual(loanApp.amount);
          expect(res.application.type).toEqual(loanApp.type);
          expect(res.application.plan.planID).toEqual(planLCT.planID);
          
          loanApp = res.application;
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("CREATE collect application: from collectApp object (Moti Hammer)", function(next){
    post.path = '/rest/operateApplication';
    post.headers['Auth'] = MH.sessID;
    var json = {'operand': 'create',
                'type':   collectApp.type,
                'amount': collectApp.amount,
                'userID': MH.userID,
                'sessID': MH.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.sessID).toEqual(MH.sessID);
          expect(res.application.userID).toEqual(MH.userID);
          expect(res.application.amount).toEqual(collectApp.amount);
          expect(res.application.type).toEqual(collectApp.type);
          
          collectApp = res.application;
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });

//
// Pendants section
//

  it("CREATE pendant Moti wants to collect from Gosha", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = MH.sessID;
    var json = {'operand': 'create',
                'pendant': [{'loanAppID': loanApp.appID,    'loanUserID': loanApp.userID,
                             'clctAppID': collectApp.appID, 'clctUserID': collectApp.userID,
                             'amount': collectApp.amount, 'type': 'collect'}],
                'userID': MH.userID,
                'sessID': MH.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.pendant.length).toEqual(1);
          MH.pendant = res.pendant[0];
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });

  it("GET: getUserPendants related to Moti", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = MH.sessID;
    var json = {'operand': 'getUserPendants',
                'userID': MH.userID,
                'sessID': MH.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          var count = res.pendant.length;
          res.pendant.forEach(function(pnd){
//console.log(pnd);
            expect(pnd.userID).toEqual(MH.userID);
            expect([pnd.loanUserID, pnd.clctUserID].indexOf(MH.userID)).toBeGreaterThan(-1);
            if(--count === 0){next()};
          });
        });
    req.write(JSON.stringify(json));
    req.end();  
  });
  it("GET: getAssignedPendants related to Gosha", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = GA.sessID;
    var json = {'operand': 'getAssignedPendants',
                'userID': GA.userID,
                'sessID': GA.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          var count = res.pendant.length;
          res.pendant.forEach(function(pnd){
//console.log(pnd);
            expect(pnd.userID).not.toEqual(GA.userID);
            expect([pnd.loanUserID, pnd.clctUserID].indexOf(GA.userID)).toBeGreaterThan(-1);
            if(--count === 0){next()};
          });
        });
    req.write(JSON.stringify(json));
    req.end();  
  });

  it("DECLINE: Gosha declines Moti's pendant", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = GA.sessID;
    var json = {'operand': 'decline',
                'pndID': MH.pendant.pndID, // Greated by Moti, assigned to Gosha
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
  it("TEST RESULT: Gosha declines Moti's pendant", function(next){
    var apps = [loanApp, collectApp]
      , count = apps.length
      ;
    apps.forEach(function(app, index){
      setTimeout(function(){
        applications.get(app.appID, {}, function(e,r){
          expect(e).toBe(null);
          if(r.type === 'loan'){
//console.log(r);
            expect(r.pendants.indexOf(MH.pendant.pndID)).toEqual(-1);
            expect(r.pending).toEqual(0);
            expect(r.amount).toEqual(r.pending + r.balance);
          };
          if(r.type === 'collect'){
//console.log(r);
            expect(r.pendants.indexOf(MH.pendant.pndID)).toEqual(-1);
          };
        });
        if(--count === 0){
          pendants.get(MH.pendant.pndID, {}, function(e,p){
            expect(e).toBe(null);
//console.log(p);
            expect(p.status).toEqual('declined');
            next();
          });
        };
      }, index * 20);
    });
  });
  it("REMOVE the Moyi's pendant", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = MH.sessID;
    var json = {'operand': 'remove',
                'pndID': MH.pendant.pndID,
                'userID': MH.userID,
                'sessID': MH.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.pndID.indexOf(MH.pendant.pndID)).toBeGreaterThan(-1);
// Check whether the pendant has been removed from the DB.
          pendants.get(MH.pendant.pndID, {}, function(e,p){
            expect(e).toBe(null);
//console.log(p);
            delete MH.pendant;
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });

  it("CREATE: pendant Moti wants to collect from Gosha", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = MH.sessID;
    var json = {'operand': 'create',
                'pendant': [{'loanAppID': loanApp.appID,    'loanUserID': loanApp.userID,
                             'clctAppID': collectApp.appID, 'clctUserID': collectApp.userID,
                             'amount': collectApp.amount, 'type': 'collect'}],
                'userID': MH.userID,
                'sessID': MH.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.pendant.length).toEqual(1);
          MH.pendant = res.pendant[0];
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("TEST RESULT: CREATE pendant Moti wants to collect from Gosha", function(next){
    var apps = [loanApp, collectApp]
      , count = apps.length
      ;
    apps.forEach(function(app, index){
      setTimeout(function(){
        applications.get(app.appID, {}, function(e,r){
          expect(e).toBe(null);
          if(r.type === 'loan'){
//console.log(r);
// From COLLECT to LOAN: Do nothing with LOAN app.
            expect(r.pendants.indexOf(MH.pendant.pndID)).toEqual(-1);
            expect(r.pending).toEqual(0);
            expect(r.amount).toEqual(r.balance);
          };
          if(r.type === 'collect'){
//console.log(r);
            expect(r.pendants.indexOf(MH.pendant.pndID)).toBeGreaterThan(-1);
          };
        });
        if(--count === 0){
          pendants.get(MH.pendant.pndID, {}, function(e,p){
            expect(e).toBe(null);
//console.log(p);
            expect(p.status).toEqual('offered');
            next();
          });
        };
      }, index * 20);
    });
  });

  it("APPROVE: Gosha approves Moti's pendant", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = GA.sessID;
    var json = {'operand': 'approve',
                'pndID': MH.pendant.pndID,
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
  it("TEST RESULT: Gosha approves Moti's pendant", function(next){
    var apps = [loanApp, collectApp]
      , count = apps.length
      ;
    apps.forEach(function(app, index){
      setTimeout(function(){
        applications.get(app.appID, {}, function(e,r){
          expect(e).toBe(null);
          if(r.type === 'loan'){
// Approved COLLECT app: update LOAN app with the relevant values
//console.log(r);
            expect(r.pendants.indexOf(MH.pendant.pndID)).toBeGreaterThan(-1);
            expect(r.pending).toEqual(MH.pendant.amount);
            expect(r.amount).toEqual(r.pending + r.balance);
          };
          if(r.type === 'collect'){
//console.log(r);
            expect(r.pendants.indexOf(MH.pendant.pndID)).toBeGreaterThan(-1);
          };
        });
        if(--count === 0){
          pendants.get(MH.pendant.pndID, {}, function(e,p){
            expect(e).toBe(null);
//console.log(p);
            expect(p.status).toEqual('approved');
            next();
          });
        };
      }, index * 20);
    });
  });

  it("CANCEL: Moti cancels his pendant", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = MH.sessID;
    var json = {'operand': 'cancel',
                'pndID': [MH.pendant.pndID],
                'userID': MH.userID,
                'sessID': MH.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("TEST RESULT: Moti cancels his pendant", function(next){
    var apps = [loanApp, collectApp]
      , count = apps.length
      ;
    apps.forEach(function(app, index){
      setTimeout(function(){
        applications.get(app.appID, {}, function(e,r){
          expect(e).toBe(null);
          if(r.type === 'loan'){
//console.log(r);
            expect(r.pendants.indexOf(MH.pendant.pndID)).toEqual(-1);
            expect(r.pending).toEqual(0);
            expect(r.amount).toEqual(r.balance);
          };
          if(r.type === 'collect'){
//console.log(r);
            expect(r.pendants.indexOf(MH.pendant.pndID)).toEqual(-1);
          };
        });
        if(--count === 0){
          pendants.get(MH.pendant.pndID, {}, function(e,p){
            expect(e).toBe(null);
//console.log(p);
            expect(p).toBe(null);
            delete MH.pendant;
            next();
          });
        };
      }, index * 20);
    });
  });

  it("CREATE: pendant Gosha offers to Moti", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = GA.sessID;
    var json = {'operand': 'create',
                'pendant': [{'loanAppID': loanApp.appID,    'loanUserID': loanApp.userID,
                             'clctAppID': collectApp.appID, 'clctUserID': collectApp.userID,
                             'amount': collectApp.amount, 'type': 'loan'}],
                'userID': GA.userID,
                'sessID': GA.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.pendant.length).toEqual(1);
          GA.pendant = res.pendant[0];
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("TEST RESULT: CREATE: pendant Gosha offers to Moti", function(next){
    var apps = [loanApp, collectApp]
      , count = apps.length
      ;
    apps.forEach(function(app, index){
      setTimeout(function(){
        applications.get(app.appID, {}, function(e,r){
          expect(e).toBe(null);
          if(r.type === 'loan'){
//console.log(r);
// From LOAN to COLLECT: the LOAN app is ready for transaction.
            expect(r.pendants.indexOf(GA.pendant.pndID)).toBeGreaterThan(-1);
            expect(r.pending).toEqual(collectApp.amount);
            expect(r.amount).toEqual(r.balance + r.pending);
          };
          if(r.type === 'collect'){
//console.log(r);
            expect(r.pendants.indexOf(GA.pendant.pndID)).toBeGreaterThan(-1);
          };
        });
        if(--count === 0){
          pendants.get(GA.pendant.pndID, {}, function(e,p){
            expect(e).toBe(null);
//console.log(p);
            expect(p.status).toEqual('offered');
            next();
          });
        };
      }, index * 20);
    });
  });
  it("GET: getAssignedPendants related to Moti", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = MH.sessID;
    var json = {'operand': 'getAssignedPendants',
                'userID': MH.userID,
                'sessID': MH.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          var count = res.pendant.length;
          res.pendant.forEach(function(pnd){
//console.log(pnd);
            expect(pnd.userID).not.toEqual(MH.userID);
            expect([pnd.loanUserID, pnd.clctUserID].indexOf(MH.userID)).toBeGreaterThan(-1);
            if(--count === 0){next()};
          });
        });
    req.write(JSON.stringify(json));
    req.end();  
  });

  it("DECLINE: Moti declines Gosha's pendant", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = MH.sessID;
    var json = {'operand': 'decline',
                'pndID': GA.pendant.pndID, // Greated by Gosha, assigned to Moti
                'userID': MH.userID,
                'sessID': MH.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("TEST RESULT: Moti declines Gosha's pendant", function(next){
    var apps = [loanApp, collectApp]
      , count = apps.length
      ;
    apps.forEach(function(app, index){
      setTimeout(function(){
        applications.get(app.appID, {}, function(e,r){
          expect(e).toBe(null);
          if(r.type === 'loan'){
//console.log(r);
// From LOAN to COLLECT. Update LOAN app remove all the commitments
            expect(r.pendants.indexOf(GA.pendant.pndID)).toEqual(-1);
            expect(r.pending).toEqual(0);
            expect(r.amount).toEqual(r.balance);
          };
          if(r.type === 'collect'){
//console.log(r);
            expect(r.pendants.indexOf(GA.pendant.pndID)).toEqual(-1);
          };
        });
        if(--count === 0){
          pendants.get(GA.pendant.pndID, {}, function(e,p){
            expect(e).toBe(null);
//console.log(p);
            expect(p.status).toEqual('declined');
            next();
          });
        };
      }, index * 20);
    });
  });
  it("REMOVE the Gosha's pendant", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = GA.sessID;
    var json = {'operand': 'remove',
                'pndID': GA.pendant.pndID,
                'userID': GA.userID,
                'sessID': GA.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.pndID.indexOf(GA.pendant.pndID)).toBeGreaterThan(-1);
// Check whether the pendant has been removed from the DB.
          pendants.get(GA.pendant.pndID, {}, function(e,p){
            expect(e).toBe(null);
//console.log(p);
            delete GA.pendant;
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });

  it("CREATE: pendant Gosha offers to Moti", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = GA.sessID;
    var json = {'operand': 'create',
                'pendant': [{'loanAppID': loanApp.appID,    'loanUserID': loanApp.userID,
                             'clctAppID': collectApp.appID, 'clctUserID': collectApp.userID,
                             'amount': collectApp.amount, 'type': 'loan'}],
                'userID': GA.userID,
                'sessID': GA.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.pendant.length).toEqual(1);
          GA.pendant = res.pendant[0];
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("GET: getUserPendants related to Gosha", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = GA.sessID;
    var json = {'operand': 'getUserPendants',
                'userID': GA.userID,
                'sessID': GA.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          var count = res.pendant.length;
          res.pendant.forEach(function(pnd){
//console.log(pnd);
            expect(pnd.userID).toEqual(GA.userID);
            expect([pnd.loanUserID, pnd.clctUserID].indexOf(GA.userID)).toBeGreaterThan(-1);
            if(--count === 0){next()};
          });
        });
    req.write(JSON.stringify(json));
    req.end();  
  });
  it("CANCEL: Gosha cancels his pendant", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = GA.sessID;
    var json = {'operand': 'cancel',
                'pndID': [GA.pendant.pndID],
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
  it("TEST RESULT: Gosha cancels his pendant", function(next){
    var apps = [loanApp, collectApp]
      , count = apps.length
      ;
    apps.forEach(function(app, index){
      setTimeout(function(){
        applications.get(app.appID, {}, function(e,r){
          expect(e).toBe(null);
          if(r.type === 'loan'){
//console.log(r);
            expect(r.pendants.indexOf(GA.pendant.pndID)).toEqual(-1);
            expect(r.pending).toEqual(0);
            expect(r.amount).toEqual(r.balance);
          };
          if(r.type === 'collect'){
//console.log(r);
            expect(r.pendants.indexOf(GA.pendant.pndID)).toEqual(-1);
          };
        });
        if(--count === 0){
          pendants.get(GA.pendant.pndID, {}, function(e,p){
            expect(e).toBe(null);
//console.log(p);
            expect(p).toBe(null);
            delete GA.pendant;
            next();
          });
        };
      }, index * 20);
    });
  });

  it("CREATE: pendant Gosha offers to Moti", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = GA.sessID;
    var json = {'operand': 'create',
                'pendant': [{'loanAppID': loanApp.appID,    'loanUserID': loanApp.userID,
                             'clctAppID': collectApp.appID, 'clctUserID': collectApp.userID,
                             'amount': collectApp.amount, 'type': 'loan'}],
                'userID': GA.userID,
                'sessID': GA.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.pendant.length).toEqual(1);
          GA.pendant = res.pendant[0];
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("APPROVE: Moti approves Gosha's pendant", function(next){
    post.path = '/rest/operatePendant';
    post.headers['Auth'] = MH.sessID;
    var json = {'operand': 'approve',
                'pndID': GA.pendant.pndID,
                'userID': MH.userID,
                'sessID': MH.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          pendants.get(GA.pendant.pndID, {}, function(e,p){
            expect(e).toBe(null);
//console.log(p);
            expect(p.amount).toEqual(collectApp.amount);
            expect(p.status).toEqual('approved');
            expect(p.type).toEqual('loan');
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });


//
// Transactions section
//

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

/*
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
*/

  it("Remove test users from the system", function(next){
    var count = testUsers.length;    
    testUsers.forEach(function(USER, index){
      setTimeout(function(){
        ldap.remove(USER.email, function(e,r){
          expect(e).toBe(undefined);
          expect(r).toBe(true);
          users.remove(USER.userID, function(e,r){
            expect(e).toBe(null);
            expect(r.result).toEqual({ ok: 1, n: 1 });
            session.remove(USER.sessID, function(e,r){
              expect(e).toBe(null);
              expect(r.result).toEqual({ ok: 1, n: 1 });
              if(--count === 0){next()};
            }) //session.remove
          }) //users.remove
        })//ldap.remove
      }, index * 100) //setTimeout
    });//forEach
  });


  it('closing the DB and LDAP connections', function(next){
    ldap.close();
    DB.close();
    next();
  });
});
