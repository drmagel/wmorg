#!/bin/env node

process.argv.length !== 3 && usage();

// Variables
var planStatus = process.argv[2]
  , d = new Date()
  , month = d.getMonth()
  , today = d.getDate()

  , activePlans = [
    { description: {'eng': 'Permanent - Active','rus': 'Постоянный - Активный','heb': 'קבוע - פָּעִיל'}, // Langs and descriptions can be edited via GUI
      duration: 3, // months
      interest: 33.3, // procents
      fromDate: getTime(month - 1), // start of active period or Date(01/01/2016)
      tillDate: 'permanent' // end of active period or 'permanent'
    },
    { description: {'eng': 'One month','rus': 'Один месяц','heb': 'חודש אחד'}, // Langs and descriptions can be edited via GUI
      duration: 1, // months
      interest: 15, // procents
      fromDate: getTime(month - 1), // start of active period or Date(01/01/2016)
      tillDate: getTime(month + 1) // end of active period or 'permanent'
    },
    { description: {'eng': 'Today','rus': 'Cегодня','heb': 'היום'}, // Langs and descriptions can be edited via GUI
      duration: 2, // months
      interest: 17, // procents
      fromDate: getDate(today), // start of active period or Date(01/01/2016)
      tillDate: getTime(month + 2) // end of active period or 'permanent'
    },
    { description: {'eng': 'A week ago - Permanent','rus': 'Неделю назад - Постоянный','heb': 'לפני שבוע - קבוע'}, //
      duration: 2, // months
      interest: 17, // procents
      fromDate: getDate(today - 7), // start of active period or Date(01/01/2016)
      tillDate: 'permanent' // end of active period or 'permanent'
    },
    { description: {'eng': 'Yesterday','rus': 'Вчера','heb': 'אתמול'}, // Langs and descriptions can be edited via GUI
      duration: 6, // months
      interest: 50, // procents
      fromDate: getDate(today - 1), // start of active period or Date(01/01/2016)
      tillDate: getTime(month + 3) // end of active period or 'permanent'
    }
  ]
  , completedPlans = [
    { description: {'eng': 'Completed','rus': 'Завершенный','heb': 'הושלם'}, // Langs and descriptions can be edited via GUI
      duration: 1, // months
      interest: 12, // procents
      fromDate: getTime(month - 2), // start of active period or Date(01/01/2016)
      tillDate: getTime(month - 1) // end of active period or 'permanent'
    }
  ]
  , pendingPlans = [
    { description: {'eng': 'Permanent - Pending','rus': 'Постоянный - Отложенный','heb': 'קבוע - בהמתנה'}, 
      duration: 2, // months
      interest: 20.3, // procents
      fromDate: getTime(month + 1), // start of active period or Date(01/01/2016)
      tillDate: 'permanent' // end of active period or 'permanent'
    },
    { description: {'eng': 'Pending - Tomorrow','rus': 'Отложенный - Завтра','heb': 'מחר - בהמתנה'}, // Langs and descriptions can be edited via GUI
      duration: 1, // months
      interest: 5.5, // procents
      fromDate: getDate(today + 1), // start of active period or Date(01/01/2016)
      tillDate: getTime(month + 2) // end of active period or 'permanent'
    },
    { description: {'eng': 'Pending','rus': 'Отложенный','heb': 'בהמתנה'}, // Langs and descriptions can be edited via GUI
      duration: 1, // months
      interest: 5.5, // procents
      fromDate: getTime(month + 1), // start of active period or Date(01/01/2016)
      tillDate: getTime(month + 2) // end of active period or 'permanent'
    }
  ]
  , plansList = []
  ;

  switch (planStatus) {
    case 'active': plansList = [].concat(activePlans);
    break;
    case 'completed': plansList = [].concat(completedPlans);
    break;
    case 'pending': plansList = [].concat(pendingPlans);
    break;
    case 'all': plansList = [].concat(activePlans).concat(completedPlans).concat(pendingPlans);
    break;
    default: console.log('The argument "'+planStatus+'" is not supported'); usage(); 
  }
// Helpers
function usage () {
  var program = process.argv[1].replace(/.*\//,'');
  console.log('The correct usage: '+program+' [all|active|completed|pending]');
  process.exit();
}

function disconnect(db){
  db.close();
  process.exit();
}

function getTime(num){
  var d = new Date()
    , u = new Date(d.setMonth(num));
  return new Date(u.getFullYear(), u.getMonth(), u.getDate()).getTime();
}

function getDate(num){
  var d = new Date()
    , u = new Date(d.setDate(num));
  return new Date(u.getFullYear(), u.getMonth(), u.getDate()).getTime();
}


// DB
var plans = require('models')('plans')
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

MongoClient.connect(dbURI, function(e,db){
  var counter = plansList.length;
  plans.setDB(db);
  count.setDB(db);
  plansList.forEach(function(pln){
    count.get('planID', function(e,r){
      if(e){
        console.log('Counters.Get: '+e);
        disconnect(db);
      }
      pln.planID = r.value.seq;
      plans.insert(pln, function(e,r){
        if(e){
          console.log('Plans.Insert: '+e);
          disconnect(db);
        }
        if(--counter === 0){
          console.log('Done...')
          disconnect(db);
        }
      });
    });
  })
});
