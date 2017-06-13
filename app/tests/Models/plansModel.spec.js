var collectionName = 'plans',
    model = require('models')(collectionName),
    MongoClient = require('mongodb').MongoClient,
    mongo = require('config').mongo,
    DB = {},
    collection = {};


//Test values
var d = new Date(),
    month = d.getMonth(),
  plan01 = { // Permanent
    planID: 1000101,
    description: {'eng': 'Permanent','rus': 'Permanent','heb': 'Permanent'}, // Langs and descriptions can be edited via GUI
    duration: 3, // months
    interest: 30, // procents
    fromDate: new Date(d.setMonth(month - 1)).getTime(), // start of active period or Date(01/01/2016)
    tillDate: 'permanent' // end of active period or 'permanent'
  }

  plan02 = { // From last month till the next
    planID: 1000102,
    description: {'eng': 'One month','rus': 'One month','heb': 'One month'}, // Langs and descriptions can be edited via GUI
    duration: 1, // months
    interest: 10, // procents
    fromDate: new Date(d.setMonth(month - 1)).getTime(), // start of active period or Date(01/01/2016)
    tillDate: new Date(d.setMonth(month + 1)).getTime() // end of active period or 'permanent'
  }

  plan03 = { // Pending
    planID: 1000103,
    description: {'eng': 'Pending','rus': 'Pending','heb': 'Pending'}, // Langs and descriptions can be edited via GUI
    duration: 1, // months
    interest: 10, // procents
    fromDate: new Date(d.setMonth(month + 1)).getTime(), // start of active period or Date(01/01/2016)
    tillDate: new Date(d.setMonth(month + 2)).getTime() // end of active period or 'permanent'
  }

  plan04 = { // Completed
    planID: 1000104,
    description: {'eng': 'Expired','rus': 'Expired','heb': 'Expired'}, // Langs and descriptions can be edited via GUI
    duration: 1, // months
    interest: 10, // procents
    fromDate: new Date(d.setMonth(month - 2)).getTime(), // start of active period or Date(01/01/2016)
    tillDate: new Date(d.setMonth(month - 1)).getTime() // end of active period or 'permanent'
  }




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
describe("Applicatons model", function() {
  it('should extend the prototypes', function(next){
    expect(model.setDB).toEqual(jasmine.any(Function));
    expect(model.insert).toEqual(jasmine.any(Function));
    expect(model.remove).toEqual(jasmine.any(Function));
    expect(model.update).toEqual(jasmine.any(Function));
    expect(model.get).toEqual(jasmine.any(Function));
    expect(model.getActivePlans).toEqual(jasmine.any(Function));
    expect(model.getPermanentPlans).toEqual(jasmine.any(Function));
    expect(model.getCompletedPlans).toEqual(jasmine.any(Function));
    expect(model.getPendingPlans).toEqual(jasmine.any(Function));
    expect(model.getAllPlans).toEqual(jasmine.any(Function));
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
  it('INSERT: should add document to the collection', function(next){
    model.insert(plan01, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 1 });
//      console.log(r.result);
//      console.log(plan01);
      // Insert all other apps.
      DB.collection(collectionName).insertMany([plan02,plan03,plan04], {w:1,j:true}, function(e,r){
        expect(e).toBe(null);
        next();
      });
    });
  });
  it('GET: should get the document from the collection', function(next){
    model.getPlan(plan01.planID,function(e,r){
      expect(e).toBe(null);
      expect(r.planID).toEqual(plan01.planID);
//      console.log(r)
      next();
    });
  });
  it('getActivePlans: should get list of active Plans from the collection', function(next){
    model.getActivePlans(function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(2);
      r.forEach(function(d){
//        console.log(d)
      });
      next();
    });
  });

  it('getPermanentPlans: should get list of permanent plans from the collection', function(next){
    model.getPermanentPlans(function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(1);
      r.forEach(function(d){
//        console.log(d)
      });
      next();
    });
  });

  it('getCompletedPlans: should get list of completed plans from the collection', function(next){
    model.getCompletedPlans(function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(1);
      r.forEach(function(d){
//        console.log(d)
      });
      next();
    });
  });

  it('getPendingPlans: should get list of pending plans from the collection', function(next){
    model.getPendingPlans(function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(1);
      r.forEach(function(d){
//        console.log(d)
      });
      next();
    });
  });

  it('getAllPlans: should get list of all plans from the collection', function(next){
    model.getAllPlans(function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(4);
      r.forEach(function(d){
//        console.log(d)
      });
      next();
    });
  });

  it('UPDATE: should update the document in the collection', function(next){
//      console.log(plan01);
    plan01.tillDate = new Date(d.setMonth(month + 3)).getTime();
    model.update(plan01.planID, plan01 ,function(e,r){
      expect(e).toBe(null);
//      console.log(r.result);
      expect(r.result).toEqual({ ok : 1, nModified : 1, n : 1 });
//      console.log(plan01);
      next();
    });
  });

  it('REMOVE: remove plan from the collection', function(next){
    model.remove(plan01.planID, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 1 });
//      console.log(r.result);
      next();
    });
  });
  it('Remove all other plans from the collection', function(next){
    DB.collection(collectionName).deleteMany({}, function(e,r){
      expect(e).toBe(null);
//      expect(r.result).toEqual({ ok: 1, n: 6 });
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
