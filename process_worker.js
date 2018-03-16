let Processor = require("./processor");

var kue = require("kue"),
  queue = kue.createQueue({
    prefix: "catalogbatch12",
    redis: {
      port: 6379,
      host: "127.0.0.1",
      // auth: 'password',
      db: 3 // if provided select a non-default redis db
    }
  });
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
var fs = require("fs");
if (!fs.existsSync("./temp")) {
  fs.mkdirSync("./temp");
}
console.log("numCPUs", numCPUs);
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  let moveFileToProcessedDir = function(item) {
    console.log("----Moving file from processing to processed ---", item.file);
  };
  let moveFileToErrorDir = function(item) {
    console.log("----Moving file from processing to error ---", item.file);
  };

  queue.process("catalogbatchqueue", function(job, ctx, done) {
    job.log("-----process----", process.pid, job.id);
    let processor = new Processor(process.pid);
    processor.start(job.data, job)
    processor.on("error", function(error) {
      moveFileToErrorDir(processor.item);

      // processor.isRunning = false;
      
      console.log("error",error);
      done(error);
    });
    
    processor.on('done',function(){
        done(null, {});
    })
  });

  // Workers can share any TCP connection
  // In this case it is an HTTP server

  console.log(`Worker ${process.pid} started`);
}
