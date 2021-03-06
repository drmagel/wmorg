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
;


// Test values

var FE = {
      email: 'dimar@v30.amdocs.com',
      password: 'Dimar0-',
      score: 5,
      userRole: ['groupAdmin','businessAdmin','officeAdmin','globalAdmin']
    }
;


// Testing the configuration file
describe("Prepare user dimar (FE):", function(){
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
  it("LOGIN: login as dimar", function(next){
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

// Operate user dimar
  it("updateUserRating: update dimar's rating increment score and evaluations", function(next){
    users.updateUserRating(FE.userID, FE.score, function(e,r){
      expect(e).toBe(null);
//console.log(r);
      next();
    });
  });

  it("updateUserRole: set admin roles to dimar", function(next){
    users.updateUserRole(FE.userID, FE.userRole, function(e,r){
      expect(e).toBe(null);
//console.log(r);
      next();
    });
  });

// Close all connections
  it('closing the DB and LDAP connections', function(next){
    ldap.close();
    DB.close();
    next();
  });
});
