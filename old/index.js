let Processor = require('./processor');

const RedisSMQ = require("rsmq");
rsmq = new RedisSMQ({ host: "127.0.0.1", port: 6379, ns: "rsmq" });
rsmq.createQueue({ qname: "catalogbatchqueue1" }, function (err, resp) {
    if (resp === 1) {
        console.log("queue created")
    }
});
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
console.log('numCPUs',numCPUs)
if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    let moveFileToProcessedDir = function(item){
        console.log('----Moving file from processing to processed ---',item.file)
    }
    let moveFileToErrorDir = function(item){
        console.log('----Moving file from processing to error ---',item.file)
    }
    let processor = new Processor(process.pid);
    processor.on('done',function(message){
        console.log('-------Done-------------',message)
        moveFileToProcessedDir(message)
        processor.isRunning = false;
        
    })
    processor.on('error',function(){
        moveFileToErrorDir(processor.item)
       
        processor.isRunning = false;

        console.log('error')
    })
    var CronJob = require('cron').CronJob;
    var job = new CronJob({
        cronTime: '* * * * *',
        onTick: function () {
            console.log('----onTick Processor--- ')
            if (!processor.isRunning) {
                processor.isRunning = true;
                rsmq.popMessage({qname:"catalogbatchqueue1"}, function (err, resp) {
                    if (resp.id) {
                        let item = {
                            file:resp.message,
                            brand:{}
                        }
                        processor.start(item)
                    }
                    else {
                        processor.isRunning = false;
                        console.log("No messages for me...")
                    }
                });
              
            } else {
                console.log(`---- Processor ${process.pid}  is running-----`)
            }

        },
        start: true,
        timeZone: 'America/Los_Angeles'
    });
    job.start();
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    console.log(`Worker ${process.pid} started`);
}
