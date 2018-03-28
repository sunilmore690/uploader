var kue = require("kue");

//inialize queue
global.__dirname = __dirname;
let queue = require('./initializers/queue');


//inialize manager
var manager = require('./workers/manager')
manager()

//inialize processor
var processor = require('./workers/processor')
processor()

var email = require('./workers/email')
email()
let port = process.env.PORT || 3030;
kue.app.listen(port);
console.log(`Queue Management Server running on ${port}`)
process.on('unhandledRejection',function(err){
    console.log(err)
})

// var kue = require('kue');
// var express = require('express');
// var kueUiExpress = require('kue-ui-express');
// var app = express();

// // kue.createQueue();
// var manager = require('./workers/manager')
// manager()

// //inialize processor
// var processor = require('./workers/processor')
// processor()
// kueUiExpress(app, '/kue/', '/kue-api/');

// // Mount kue JSON api
// app.use('/kue-api/', kue.app);

// app.listen(3000);