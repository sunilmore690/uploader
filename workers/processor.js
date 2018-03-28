let Uploader = require("./uploader"),
  queue = require("../initializers/queue");

let moveFileToProcessedDir = function(item) {
  console.log("----Moving file from processing to processed ---", item.file);
};
let moveFileToErrorDir = function(item) {
  console.log("----Moving file from processing to error ---", item.file);
};

const sendErrorEmail = function(item, err) {
  console.log('Calling sendErrorEmail')
  var emailjob = queue
    .create("email", { item: item, err: err })
    // .priority(priority)
    attemps(2)
    .save(function(err) {
      if (!err) console.log("emailjobid", emailjob.id);
      if (err) console.log("email queueerr", err);
    });
    emailjob
    .on("complete", function(id, result) {
      console.log(" mangerjob Job completed with data ", result);
      kue.Job.get(id, function(err, job) {
        if (err) return;
        job.remove(function(err) {
          if (err) throw err;
          console.log("removed completed mangerjob #%d", emailjob.id);
        });
      });
    })
    .on("failed attempt", function(errorMessage, doneAttempts) {
      console.log("mangerjob failed attempt");
    })
    .on("failed", function(errorMessage) {
      console.log("mangerjob failed", errorMessage);
    })
    .on("progress", function(progress, data) {
      console.log(
        "\r  job #" + emailjob.id + " " + progress + "% complete with data ",
        data
      );
    });
};
module.exports = function() {
  queue.process("catalogbatchqueue", 4, function(job, ctx, done) {
    job.log("-----process----");
    let item = job.data;

    let uploader = new Uploader(item, job);
    uploader.on("error", function(err) {
      moveFileToErrorDir(uploader.item);
      sendErrorEmail(uploader.item, err);
      done(err);
    });
    uploader.on("done", function(message) {
      job.progress(90, 100);
      console.log("done", message);
      // moveFileToProcessedDir(message);
      done(null, item);
    });
    uploader.start();
    
  });
};
