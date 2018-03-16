var CronJob = require('cron').CronJob;
var kue = require('kue')
  , queue = kue.createQueue(
    {
      prefix: 'catalogbatch8',
      redis: {
        port: 6379,
        host: '127.0.0.1',
        // auth: 'password',
        db: 3, // if provided select a non-default redis db 

      }
    });


var i = 0;
var job = new CronJob({
  cronTime: '*/5 * * * * *',
  onTick: function () {
    console.log('--On Tick  Manager ---')
    i++;
    // rsmq.sendMessage({ qname: "catalogbatchqueue1", message: i+''}, function (err, resp) {
    //     if (resp) {
    //         console.log("Message sent. ID:", resp,i);
    //     }
    //     console.log('err',err)
    // });
    selectRandomBrand()



  },
  start: true,
  timeZone: 'America/Los_Angeles'
});
job.start();

let items = [1, 2, 3, 4, 5, 6, 7, 8]
let selectRandomBrand = function () {
  var item = items[Math.floor(Math.random()*items.length)];
  console.log('------------Random brand----',item)
  let brand = {
    id: item,
    name: `brand${item}`,
    mapping: {

    },
    priority: 'high',
    ftp: {
      host: 'ftp.filezapp.com',
      port: 21,
      user: 'sunil@filezapp.com',
      password: 'Laxman_usha90'
    },
    uploadDir: `/uploadrewrite/${item}/upload`,
    enqueuedDir: `/uploadrewrite/${item}/enqueued`,
    processingDir: `/uploadrewrite/${item}/processing`,
    errorDir: `/uploadrewrite/${item}/error`,
  }
  var mangerjob = queue.create('brandmanagerqueue', { brand: brand,title:brand.name }).save(function (err) {
    if (!err) console.log('managerjobid', mangerjob.id);
    if(err)console.log('err',err)
  });
  mangerjob.on('complete', function (id, result) {
    console.log(' mangerjob Job completed with data ', result);
    kue.Job.get(id, function (err, job) {
      if (err) return;
      job.remove(function (err) {
        if (err) throw err;
        console.log('removed completed job #%d', job.id);
      });
    });

  }).on('failed attempt', function (errorMessage, doneAttempts) {
    console.log('Job failed attempt');

  }).on('failed', function (errorMessage) {
    console.log('Job failed', errorMessage);

  }).on('progress', function (progress, data) {
    console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data);

  });
}

queue.process('brandmanagerqueue',2, function (job, ctx, done) {
  console.log('----Processing brandmanagerqueue-----')
  let brand = job.data.brand;

  var files = getFiles(brand);
  let priority = 'normal'
  if (brand.hasOwnProperty('priority')) {
    priority = 'high';
  }
  files.forEach(function (file) {
  
    addBrandFileToQueue(brand, file,priority);
  })
  setTimeout(function(){
    done(null,{brand:brand})
  },1000)
  
})
let addBrandFileToQueue = function (brand, file,priority) {
  console.log('----Calling addBrandFileToQueue')
  var job = queue.create('catalogbatchqueue', {optId:brand.id+'', brand,file,title:`Brand: ${brand.id}   File: ${file.name}` }).priority(priority).searchKeys( ['optId'] ).save(function (err) {
    if (!err) console.log('jobid', job.id);
    if(err)console.log('err',err)
  });
  job.on('complete', function (id, result) {
    console.log('uploaderqueue Job completed with data ', result);
    kue.Job.get(id, function (err, job) {
      if (err) return;
      job.remove(function (err) {
        if (err) throw err;
        console.log('removed completed job #%d', job.id);
      });
    });

  }).on('failed attempt', function (errorMessage, doneAttempts) {
    console.log('Job failed attempt');

  }).on('failed', function (errorMessage) {
    console.log('Job failed', errorMessage);

  }).on('progress', function (progress, data) {
    console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data);

  });
}

let getFiles = function (brand, cb) {

  return [{ name: 'file1.csv' }, { name: 'file2.csv' }, { name: 'file3.csv' }, { name: 'file4.csv' }]
}