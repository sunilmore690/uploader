var CronJob = require('cron').CronJob,
    rsmq = require('rsmq');

const RedisSMQ = require("rsmq");
rsmq = new RedisSMQ({ host: "127.0.0.1", port: 6379, ns: "rsmq" });
rsmq.createQueue({ qname: "catalogbatchqueue1" }, function (err, resp) {
    if (resp === 1) {
        console.log("queue created")
    }
});
var i = 0;
var job = new CronJob({
    cronTime: '*/5 * * * * *',
    onTick: function () {
        console.log('--On Tick  Manager ---')
        i++;
        rsmq.sendMessage({ qname: "catalogbatchqueue1", message: i+''}, function (err, resp) {
            if (resp) {
                console.log("Message sent. ID:", resp,i);
            }
            console.log('err',err)
        });

    },
    start: true,
    timeZone: 'America/Los_Angeles'
});
job.start();