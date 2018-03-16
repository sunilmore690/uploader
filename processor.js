let events = require("events"),
  FtpClient = require("ftp"),
  fs = require("fs");
class Processor extends events {
  constructor(pid) {
    console.log("pid", pid);
    super();
    this.isRunning = false;
    this.pid = pid;
    this.ftpclient = new FtpClient();
  }
  start(item, job, cb) {
    job.log("--------Start-----------");
    this.ftpclient.connect(item.brand.ftp);
    this.job = job;
    this.cb = cb || function() {};
    console.log("item", item);
    this.item = item;
    this.moveFileToProcessingDir();
  }
  moveFileToProcessingDir() {
    this.job.log("--------moveFileToProcessingDir-----------");
    const brand = this.item.brand,
      file = this.item.file,
      that = this;

    this.ftpclient.rename(
      brand.dir.enqueued + file.name,
      brand.dir.processing + file.name,
      function(err) {
        that.ftpclient.end();
        if (err) {
          that.job.log(
            "Ftp Error: moving file from " +
              brand.dir.enqueued +
              file.name +
              " to" +
              brand.dir.processing +
              file.name
          );
          that.emit('error',err)
          return;
        }
        that.downloadFileFromFtp();
      }
    );
    // this.downloadFileFromFtp();
  }
  downloadFileFromFtp() {
    let that = this;
    this.job.log("--------downloadFileFromFtp-----------");
    this.job.log("--Downloading File From Ftp", this.pid);
    let brandTempDir = "./temp/" + this.item.brand.optId + "/";
    if (!fs.existsSync(brandTempDir)) {
      fs.mkdirSync(brandTempDir);
    }
    this.ftpclient.get(
      this.item.brand.dir.processing + this.item.file.name,
      function(err, stream) {
          console.log('error',err)
        if (err) return that.emit("error", err);
        stream.once("close", function() {
          that.ftpclient.end();
          that.seamless();
        });
        readable.on('data', (chunk) => {
            console.log(`Received ${chunk.length} bytes of data.`);
          });
        stream.pipe(fs.createWriteStream(brandTempDir + that.item.file.name));
      }
    );
  }
  seamless() {
    this.job.log("----- Seamless ------", this.pid);
    let that = this;
    var i = 0;
    var myVar = setInterval(function() {
      that.job.log("sending!" + i);
      i++;
      that.job.progress(i, 300);
    }, 1000);
    setTimeout(function() {
      clearInterval(myVar);
      console.log("Call setTimeout", that.pid);
      that.modifiedfile = "file";
      that.applyBrandMapping();
    }, 100000);
  }
  applyBrandMapping() {
    this.job.log("-----applyBrandMapping----", this.pid);
    // brand productsSpecification.xml
    let seamlessfile = this.seamlessfile;

    //apply mapping to seamless file

    this.mappedfile = "mappingfile";
    this.uploader();
  }
  uploader() {
    this.job.log("---Calling uploader-----");

    //done uploader
    this.cb();
    this.emit("done", { file: this.item.file, pid: this.pid });

    //If error
    // this.emit("error");
  }
}
module.exports = Processor;
