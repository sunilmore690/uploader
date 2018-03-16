let Processor = require('./processor');

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
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
console.log('numCPUs', numCPUs)
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
    let moveFileToProcessedDir = function (item) {
        console.log('----Moving file from processing to processed ---', item.file)
    }
    let moveFileToErrorDir = function (item) {
        console.log('----Moving file from processing to error ---', item.file)
    }
    let processor = new Processor(process.pid);
    
    processor.on('error', function () {
        moveFileToErrorDir(processor.item)

        // processor.isRunning = false;

        console.log('error')
    })
    queue.process('catalogbatchqueue', function (job,ctx, done) {
        console.log('-----process----',process.pid,job.id,processor.isRunning)
          
            // ctx.pause( 5000, function(err){
                
            // });
            console.log(job.data)
            let item = {
                file: job.data.message,
                brand: {}
            }
            
            processor.start(item,job,function(data){
                console.log('got callback')
                // processor.isRunning = false;
                done(null, {})
            })
            
        
        // processor.on('done', function (message) {
        //     console.log('done',message)
        //     moveFileToProcessedDir(message)
            
        //     processor.isRunning = false;
            
            
        //     // ctx.resume()
        // })


    });

    // Workers can share any TCP connection
    // In this case it is an HTTP server
   
    console.log(`Worker ${process.pid} started`);
}
