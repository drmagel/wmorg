#!/bin/env node
var collectionName = 'counters',
    MongoClient = require('mongodb').MongoClient,
    mongo = require('config').mongo,
    yearInit = Number(new Date().getFullYear() + '000000000');



//Init values
// yearInit seq: 2016000000000
var counters = [{
  _id: 'userID',
  seq: 100000000000
},
{
  _id: 'planID',
  seq: 10000
},
{
  _id: 'pndID',
  seq: yearInit
},
{
  _id: 'appID',
  seq: yearInit
},
{
  _id: 'transID',
  seq: yearInit
}]

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

MongoClient.connect(dbURI, function(e,db) {
  db.collection(collectionName).deleteMany({},{w:1},function(){
    db.collection(collectionName).insertMany(counters,{w:1},function(){db.close()});
  });
});
