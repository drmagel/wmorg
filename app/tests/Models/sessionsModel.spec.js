var collectionName = 'sessions'
  , model = require('models')(collectionName)
  , MongoClient = require('mongodb').MongoClient
  , mongo = require('config').mongo
  , session = require('config').session
  , DB = {}
  , collection = {};

//Test values
var time = function(min){
  var d = new Date();
  return new Date(d.setMinutes(d.getMinutes() + min)).getTime();
};

var sess01 = { // Just created
  userID: 100001011
}
,
    sess02 = { 
  sessID: session.generate_sessID(),
  userID: 100001012,
  validTill: time(20)
}
,
    sess03 = { 
  sessID: session.generate_sessID(),
  userID: 100001013,
  validTill: time(15)
}
,
    sess04 = {
  sessID: session.generate_sessID(),
  userID: 100001014,
  validTill: time(-15)
};

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
describe("Sessions model", function() {
  it('should extend the prototypes', function(next){
    expect(model.setDB).toEqual(jasmine.any(Function));
    expect(model.insert).toEqual(jasmine.any(Function));
    expect(model.remove).toEqual(jasmine.any(Function));
    expect(model.update).toEqual(jasmine.any(Function));
    expect(model.get).toEqual(jasmine.any(Function));
    expect(model.getValidSess).toEqual(jasmine.any(Function));
    expect(model.delInvalidSess).toEqual(jasmine.any(Function));
    expect(model.getUsersSess).toEqual(jasmine.any(Function));
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
  it('INSERT: should add session to the collection', function(next){
    model.insert(sess01, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 1 });
//      console.log(r.result);
      // Get the sess01.sessID
      DB.collection(collectionName)
        .find({userID: sess01.userID},
              {_id:0,sessID:1})
        .limit(1)
        .next(function(e,r){
          expect(e).toBe(null);
          expect(r.sessID).not.toBe(null);
          sess01.sessID = r.sessID;
          // Insert all other sessions.
          DB.collection(collectionName).insertMany([sess02,sess03,sess04], {w:1,j:true}, function(e,r){
            expect(e).toBe(null);
            expect(r.result).toEqual({ ok: 1, n: 3 });
            next();
          });
        }); // next()
    });
  });
  it('GET: should get the document from the collection', function(next){
    model.get(sess01.sessID,{userID: 1},function(e,r){
      expect(e).toBe(null);
      expect(r.userID).toEqual(sess01.userID);
//      console.log(r);
      next();
    });
  });
  it('getInvalidSess: should display invalid sessions', function(next){
    model.getInvalidSess(function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(1);
      r.forEach(function(d){
        expect(d.userID).toEqual(sess04.userID);
//        console.log(d)
      });
      next();
    });
  });
  it('VALIDATE: invalid session', function(next){
    model.validate(sess04.sessID, function(e,r){
      expect(e).toBe(null);
      expect(r.value).toBe(null);
      next();
    });
  });
  it('VALIDATE: valid session', function(next){
    model.validate(sess03.sessID, function(e,r){
      expect(e).toBe(null);
      expect(r.value.sessID).toEqual(sess03.sessID);
      next();
    });
  });
  it('delInvalidSess: should remove invalid sessions from the collection', function(next){
    model.delInvalidSess(function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 1 });
//      console.log(r.result);
      next();
    });
  });
  it('UPDATE: should update validTill to sessionActivePeriod', function(next){
    model.update(sess02.sessID,function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
//      console.log(r.result)
      next();
    });
  });
  it('getValidSess: should get valid sessions', function(next){
    model.getValidSess(function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(3);
      r.forEach(function(d){
//        console.log(d)
      });
      next();
    });
  });
  it('getUsersSess: should get list of documets owned by user from the collection', function(next){
    model.getUsersSess(sess01.userID, {}, function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(1);
      r.forEach(function(d){
//        console.log(d)
        expect(d.sessID).toEqual(sess01.sessID);
      });
      next();
    });
  });
  it('REMOVE: remove session from the collection', function(next){
    model.remove(sess01.sessID, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 1 });
//      console.log(r.result);
      next();
    });
  });
  it('Remove all other apps from the collection', function(next){
    DB.collection(collectionName).deleteMany({}, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 2 });
      next();
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

