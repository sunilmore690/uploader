let Uploader = require("./uploader"),
  queue = require("../initializers/queue");

let moveFileToProcessedDir = function(item) {
  console.log("----Moving file from processing to processed ---", item.file);
};
let moveFileToErrorDir = function(item) {
  console.log("----Moving file from processing to error ---", item.file);
};

module.exports = function() {
  queue.process("catalogbatchqueue", 4,function(job, ctx, done) {
    job.log("-----process----");
    let item = job.data;


    let uploader = new Uploader(item, job);
    uploader.start();
    uploader.on("error", function(err) {
      moveFileToErrorDir(uploader.item);
      done(err);
    });
    uploader.on("done", function(message) {
     job.progress(90,100)
      console.log("done", message);
      moveFileToProcessedDir(message);
      done(null,item)
    });
  });
};
