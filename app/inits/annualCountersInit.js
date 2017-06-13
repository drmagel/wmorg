#!/bin/env node
var collectionName = 'counters',
    MongoClient = require('mongodb').MongoClient,
    mongo = require('config').mongo,
    yearInit = Number(new Date().getFullYear() + '000000000');



//Init values
// yearInit seq: 2017000000000
/*** Initial stucture
var counters = [
      {
        _id: 'appID',
        seq: yearInit
      },
      {
        _id: 'pndID',
        seq: yearInit
      },
      {
        _id: 'transID',
        seq: yearInit
      }
    ]
****/

var counters = ['appID', 'pndID', 'transID'];

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
  var cntr = counters.length;
  counters.forEach(function(id){
    db.collection(collectionName).updateOne({_id: id}, {$set: {seq: yearInit}}, function(){
      if(--cntr === 0){db.close()}
    });
  });
});
