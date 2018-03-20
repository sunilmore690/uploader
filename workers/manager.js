var CronJob = require("cron").CronJob,
  kue = require("kue"),
  queue = require("../initializers/queue"),
  async_lib = require("async");

module.exports = function() {
  var job = new CronJob({
    cronTime: "*/5 * * * * *",
    onTick: function() {
      console.log("--On Tick  Manager ---");
      selectRandomBrand();
    },
    start: true,
    timeZone: "America/Los_Angeles"
  });
  job.start();
};

let brands = [1, 2, 3, 4, 5, 6, 7, 8];
let selectRandomBrand = function() {
  var item = brands[Math.floor(Math.random() * brands.length)];
  console.log("------------Random brand----", item);
  let brand = {
    id: item,
    name: `brand${item}`,
    mappingRule: {},
    priority: "high",
    ftp: {
      host: "ftp.host.com",
      port: 21,
      user: "user",
      password: "password"
    },
    uploadDir: `/path/to/upload/dir/${item}`,
    enqueuedDir: `/path/to/enqueued/dir/${item}`,
    processingDir: `/path/to/upload/dir/${item}`,
    errorDir: `/path/to/error/dir/${item}`
  };
  console.log("----------------------------------------------");
  console.log("Adding Brand to queue");
  console.log("----------------------------------------------");
  var mangerjob = queue
    .create("brandmanagerqueue", { brand: brand, title: brand.name })
    .save(function(err) {
      if (!err) console.log("managerjobid", mangerjob.id);
      if (err) console.log("err", err);
    });
  mangerjob
    .on("complete", function(id, result) {
      console.log(" mangerjob Job completed with data ", result);
      kue.Job.get(id, function(err, job) {
        if (err) return;
        job.remove(function(err) {
          if (err) throw err;
          console.log("removed completed job #%d", job.id);
        });
      });
    })
    .on("failed attempt", function(errorMessage, doneAttempts) {
      console.log("Job failed attempt");
    })
    .on("failed", function(errorMessage) {
      console.log("Job failed", errorMessage);
    })
    .on("progress", function(progress, data) {
      console.log(
        "\r  job #" + job.id + " " + progress + "% complete with data ",
        data
      );
    });
};

//Here brandmanagerqueue process
queue.process("brandmanagerqueue", function(job, ctx, done) {
  job.log("----Processing brandmanagerqueue-----");
  let brand = job.data.brand;
  var files = getCatalogFiles(brand);
  let priority = "normal";
  if (brand.hasOwnProperty("priority")) {
    priority = brand['priority'];
  }
  async_lib.each(
    files,
    function(file, callback) {
      // Perform operation on file here.
      job.log(`Brand: ${brand.optId} , Adding File ${file.name} to Queue`)
      addBrandFileToQueue(brand, file, priority,callback);
    },
    function(err) {
      job.log("All files added to queue");
      // if any of the file processing produced an error, err would equal that error
      done(null, { brand: brand });
    }
  );
});

let addBrandFileToQueue = function(brand, file, priority,cb) {
  console.log("----Calling addBrandFileToQueue");
  var job = queue
    .create("catalogbatchqueue", {
      optId: brand.id,
      brand,
      file,
      title: `Brand: ${brand.id}   File: ${file.name}`
    })
    .priority(priority)
    .searchKeys(["optId"])
    .save(function(err) {
      if (!err) console.log("jobid", job.id);
      if (err) console.log("err", err);
      cb()
    });

  job
    .on("complete", function(id, result) {
      console.log("uploaderqueue Job completed with data ", result);
      kue.Job.get(id, function(err, job) {
        if (err) return;
        job.remove(function(err) {
          if (err) throw err;
          console.log("removed completed job #%d", job.id);
        });
      });
    })
    .on("failed attempt", function(errorMessage, doneAttempts) {
      console.log("Job failed attempt");
    })
    .on("failed", function(errorMessage) {
      console.log("Job failed", errorMessage);
    })
    .on("progress", function(progress, data) {
      console.log(
        "\r  job #" + job.id + " " + progress + "% complete with data ",
        data
      );
    });
};

let getCatalogFiles = function(brand, cb) {
  return [
    { name: "file1.csv" },
    { name: "file2.csv" },
    { name: "file3.csv" },
    { name: "file4.csv" }
  ];
};
