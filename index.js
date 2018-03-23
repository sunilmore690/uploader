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

let port = process.env.PORT || 3030;
kue.app.listen(port);
console.log(`Queue Management Server running on ${port}`)
process.on('unhandledRejection',function(err){
    console.log(err)
})