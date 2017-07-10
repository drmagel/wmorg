var collectionName = 'enrolls'
  , model = require('models')(collectionName)
  , MongoClient = require('mongodb').MongoClient
  , mongo = require('config').mongo
  , DB = {}
  , collection = {};

//Test values
var time = function(days){
  var d = new Date();
  return new Date(d.setDate(d.getDate() + days)).getTime();
};

var verStr = function(){
  return Math.random().toString(26).replace(/[^a-z]+/g, '').substr(1,8);
}
,
    verNum = function(){
  return Number(Math.random().toString().replace(/[^\d]+/g, '').substr(1,8));
}

var enroll01 = { // Just created
  email: "enroll01.v30.amdocs.com",
  string: verStr(),
  number: verNum(),
  enrolmentDate: new Date().getTime()
}
,
    enroll02 = { 
  email: "enroll01.v30.amdocs.com",
  string: verStr(),
  number: verNum(),
  enrolmentDate: time(-1)
}
,
    enroll03 = { 
  email: "enroll03.v30.amdocs.com",
  string: verStr(),
  number: verNum(),
  enrolmentDate: time(-1)
}
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
describe("Sessions model", function() {
  it('should extend the prototypes', function(next){
    expect(model.setDB).toEqual(jasmine.any(Function));
    expect(model.insert).toEqual(jasmine.any(Function));
    expect(model.get).toEqual(jasmine.any(Function));
    expect(model.remove).toEqual(jasmine.any(Function));
    expect(model.clean).toEqual(jasmine.any(Function));
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
  it('INSERT: should add enroll01 to the collection', function(next){
    model.insert(enroll01, function(e,r){
      expect(e).toBe(null);
//      console.log(r);
      expect(r.ok).toEqual(1);
      // Get the enrollment
      DB.collection(collectionName)
        .find({email: enroll01.email},
              {_id:0})
        .next(function(e,r){
          expect(e).toBe(null);
//          console.log(r);
          expect(r.email).toEqual(enroll01.email);
          next();
        });
    });
  });
  it('GET: should get the document from the collection', function(next){
    model.get(enroll01,function(e,r){
      expect(e).toBe(null);
//      console.log(r);
      expect(r.email).toEqual(enroll01.email);
      next();
    });
  });
  it('GET: should return null because no such document in the collection', function(next){
    model.get(enroll03,function(e,r){
      expect(e).toBe(null);
//      console.log(r);
      expect(r).toEqual(null);
      next();
    });
  });
  it('INSERT: should update the existent document', function(next){
    model.insert(enroll02,function(e,r){
      expect(e).toBe(null);
//      console.log(r);
      expect(r.ok).toEqual(1);
      expect(r.lastErrorObject.n).toEqual(1);
      expect(r.value.string).toEqual(enroll02.string);
      expect(r.value.number).toEqual(enroll02.number);
      expect(r.value.email).toEqual(enroll02.email);
      expect(r.value.email).toEqual(enroll01.email);
      next();
    });
  });
  it('VALIDATE: there is only one enrollment document in the collection', function(next){
    DB.collection(collectionName)
      .find({email: enroll01.email},
            {_id:0})
      .toArray(function(e,r){
        expect(e).toBe(null);
//        console.log(r);
          expect(r.length).toEqual(1);
        next();
      });
  });
  it('REMOVE: should remove the enrollment', function(next){
    model.remove(enroll01.email, function(e,r){
      expect(e).toBe(null);
//      console.log(r);
      expect(r.result).toEqual({ ok: 1, n: 1 });
      next();
    });
  });
  it('CLEAN: should remove all old enrollments from the collection', function(next){
    model.insert(enroll02,function(e,r){
      expect(e).toBe(null);
      expect(r.ok).toEqual(1);
      model.insert(enroll03,function(e,r){
        expect(e).toBe(null);
        expect(r.ok).toEqual(1);
        model.clean(function(e,r){
//          console.log(r);
          expect(r.result).toEqual({ ok: 1, n: 2 });
          next();
        })
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

