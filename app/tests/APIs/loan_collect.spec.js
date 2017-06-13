/**
* Test description:
* - Create 2 users, one is a GlobalAdmin
* - Create a plan
* - Create 2 applications: LOAN and COLLECT
* - Create 2 pendants
* - Reject 1 offer (pendant)
* - Accept 1 offer (pendant)
* - Create transaction from the pendant
* - Accept transaction
* 
* 
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
  , count = require('models')('counters')
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
      email: 'globAdmin@v30.amdocs.com',
      password: '1234'
    }

  , GlobalAdmin = {
      firstName:  'Global',
      familyName: 'Admin',
      phone: '545433666',
      email: 'globAdmin@v30.amdocs.com',
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

var d = new Date()
  , month = d.getMonth()
  , today = d.getDate()
  , tomorrow = new Date(d.setDate(today + 1)).getTime()

  , plan01 = { // Permanent
      description: {'eng': 'Loan - Collect Test','rus': 'Loan - Collect Test','heb': 'Loan - Collect Test'}, // Langs and descriptions can be edited via GUI
      duration: 3, // months
      interest: 30, // procents
      fromDate: getTime(month - 2), // start of active period or Date(01/01/2016)
      tillDate: 'permanent' // end of active period or 'permanent'
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
      next();
    });
  });
  it("createUser: Create new user Kimi Put", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var json = {'email': FE.email,
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

  it("createUser: Create Global Admin", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var json = {'email': GA.email,
                'password': GA.password,
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
