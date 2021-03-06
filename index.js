var kue = require("kue");

//inialize queue
let queue = require('./initializers/queue');


//inialize manager
var manager = require('./workers/manager')
manager()

//inialize processor
var processor = require('./workers/processor')
processor()

let port = process.env.PORT || 3000;
kue.app.listen(port);
console.log(`Queue Management Server running on ${port}`)
