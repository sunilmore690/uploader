let CronJob = require("cron").CronJob,
  config = require("config"),
  kue = require("kue"),
  async_lib = require("async"),
  FtpClient = require("ftp"),
  _ = require("lodash");

let ftp = new FtpClient();

let queue = kue.createQueue({
  prefix: "catalogbatch12",
  redis: {
    port: 6379,
    host: "127.0.0.1",
    // auth: 'password',
    db: 3 // if provided select a non-default redis db
  }
});

var job = new CronJob({
  cronTime: "*/5 * * * * *", //every 5 second
  onTick: function() {
    console.log("----- Manager Cron ------");
    selectRandomBrand();
  },
  start: true,
  timeZone: "America/Los_Angeles"
});
job.start();

let items = config.brands || [];
let selectRandomBrand = function() {
  var brand = items[Math.floor(Math.random() * items.length)];
  console.log("brand", brand.optId);
  let priority = "normal";
  if (brand.priority) {
    priority = brand.priority;
  }
  var mangerjob = queue
    .create("brandmanagerqueue", { brand: brand, title: brand.name })
    .priority(priority)
    .save(function(err) {
      if (!err) console.log("managerjobid", mangerjob.id);
      if (err) console.log("brand queueerr", err);
    });
  mangerjob
    .on("complete", function(id, result) {
      console.log(" mangerjob Job completed with data ", result);
      kue.Job.get(id, function(err, job) {
        if (err) return;
        job.remove(function(err) {
          if (err) throw err;
          console.log("removed completed mangerjob #%d", job.id);
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
        "\r  job #" + job.id + " " + progress + "% complete with data ",
        data
      );
    });
};

queue.process("brandmanagerqueue",2, async function(job, ctx, done) {
  job.log("----Processing brandmanagerqueue-----", job.data.brand.optId);
  let brand = job.data.brand;

  try {
    var files = await getFiles(brand);
    files = _.sortBy(files, function(file) {
      return -file.date;
    });
    files = _.filter(files, { type: "-" });
    console.log("Files", files);
    let priority = "normal";
    if (brand.hasOwnProperty("priority")) {
      priority = "high";
    }
    async_lib.eachSeries(files,function(file,cb){
      job.log(`Brand : ${brand.optId} File: ${file}`)
      addBrandFileToQueue(brand, file, priority,cb);
    },function(){
      job.log('---All files added to queue -----')
      console.log('--All files finished---')
      done(null,brand)
    })
  } catch (e) {
    console.log("e", e);
    done(e);
  }
});
let addBrandFileToQueue = function(brand, file, priority,cb) {
  cb = cb || function(){}
  console.log("----Calling addBrandFileToQueue");
  var job = queue
    .create("catalogbatchqueue", {
      optId: brand.optId + "",
      brand,
      file,
      title: `Brand: ${brand.optId}   File: ${file.name}`
    })
    .priority(priority)
    .searchKeys(["optId"])
    .save(function(err) {
      
      if (!err){
        //move File To Processing Dir
        console.log('brand',brand.ftp)
       let ftp = new FtpClient()
        ftp.connect(brand.ftp)

        console.log('move file from '+brand.dir.upload + file.name+' to '+brand.dir.enqueued + file.name)
        ftp.rename(brand.dir.upload + file.name,brand.dir.enqueued + file.name,function(err){
          console.log('errft',err)
          cb() 
          ftp.end()
        })
        return ;
      }
      cb()
      if (err) console.log("err", err);
    });
  job.on("complete", function(id, result) {
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

let getFiles = function(brand) {
  // Return new promise
  return new Promise(function(resolve, reject) {
    ftp.connect(brand.ftp);
    ftp.list(brand.dir.upload, function(err, list) {
      if (err) reject(err);
      resolve(list);
      ftp.end();
    });
  });
};

process.on("unhandledRejection", function(err) {
  console.log("err", err);
});
