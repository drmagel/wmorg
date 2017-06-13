var collectionName = 'lockedusers'
  , model = require('models')(collectionName)
  , MongoClient = require('mongodb').MongoClient
  , mongo = require('config').mongo
  , login = require('config').login
  , DB = {}
  , collection = {};

//Test values
var time = function(min){
  var d = new Date();
  return new Date(d.setMinutes(d.getMinutes() + min)).getTime();
};

var mail01 = 'mail01@wwmm.org'
  , mail02 = 'mail02@wwmm.org'
  , mail03 = 'mail03@wwmm.org'
  , mail04 = 'mail04@wwmm.org'
  ;

// Connection URI
var dbURI = 'mongodb://' +
    mongo.dbuser +
    ':' +
    mongo.dbpass +
    '@' +
    mongo.host +
    ':' +
    mongo.port +
    '/' + mongo.dbname;

// Tests. r - result, e - error, d - document, db - database
describe("Lockedusers model", function() {
  it('should extend the prototypes', function(next){
    expect(model.setDB).toEqual(jasmine.any(Function));
    expect(model.insert).toEqual(jasmine.any(Function));
    expect(model.remove).toEqual(jasmine.any(Function));
    expect(model.update).toEqual(jasmine.any(Function));
    expect(model.get).toEqual(jasmine.any(Function));
    expect(model.lock).toEqual(jasmine.any(Function));
    next();
  });
  it("is there a DB server running", function(next) {
    MongoClient.connect(dbURI, function(e,db) {
      expect(e).toBe(null);
      expect(db).toBeDefined();
      DB = db;   // Setting the real DB
      model.setDB(DB);
      next();
    });
  });
  it('GET&INSERT: should get nothing and then insert the document', function(next){
    model.get(mail01,function(e,r){
      expect(e).toBe(null);
      expect(r).toBe(null);
      model.insert(mail01, function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, n: 1 });
        next();
      });
//      console.log(r);
    });
  });
  it('GET&UPDATE to 2: should get document and then update it', function(next){
    model.get(mail01,function(e,r){
      expect(e).toBe(null);
      expect(r).not.toBe(null);
      expect(r.lockedTill).toBe(null);
      expect(r.attempts).toEqual(1);
      expect(r.attempts).toBeLessThan(login.maxWrongPasswdNum);
      model.update(mail01, function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
        next();
      });
    });
  });
  it('GET&UPDATE to 3: should get document and then update it', function(next){
    model.get(mail01,function(e,r){
      expect(e).toBe(null);
      expect(r).not.toBe(null);
      expect(r.lockedTill).toBe(null);
      expect(r.attempts).toEqual(2);
      expect(r.attempts).toBeLessThan(login.maxWrongPasswdNum);
      model.update(mail01, function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
        next();
      });
    });
  });
  it('GET&LOCK: should get document and then update it', function(next){
    model.get(mail01,function(e,r){
      expect(e).toBe(null);
      expect(r).not.toBe(null);
      expect(r.lockedTill).toBe(null);
      expect(r.attempts).toEqual(login.maxWrongPasswdNum);
      model.lock(mail01, function(e,r){
         expect(e).toBe(null);
         expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
         next();
      });
    });
  });
  it('GET&RENEW: should get document and then remove it', function(next){
    model.get(mail01,function(e,r){
      expect(e).toBe(null);
      expect(r).not.toBe(null);
      expect(r.attempts).toEqual(login.maxWrongPasswdNum);
      expect(r.lockedTill).not.toBe(null);
      expect(new Date().getTime()).toBeLessThan(r.lockedTill);
      model.renew(mail01, function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
        next();
      });
    });
  });
  it('GET&REMOVE: should get document and then remove it', function(next){
    model.get(mail01,function(e,r){
      expect(e).toBe(null);
      expect(r).not.toBe(null);
      expect(r.attempts).toEqual(1);
      expect(r.lockedTill).toBe(null);
      model.remove(mail01, function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, n: 1 });
        next();
      });
    });
  });
  it('closing the DB', function(next){
    DB.close();
    next();
  });
//  it('', function(next){
//
//    next();
//  });
});
