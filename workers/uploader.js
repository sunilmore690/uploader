let events = require("events");
class Uploader extends events {
  constructor(item, job) {
    super();
    this.item = item;
    this.job = job;
  }
  start() {
    this.job.log("-- Start -- ");
    this.job.progress(10, 100);
    this.downloadFileFromFtp();
  }
  downloadFileFromFtp() {
    let that = this;
    setTimeout(function() {
      that.seamless();
    }, 1000);
  }
  seamless() {
    this.job.progress(30, 100);
    this.job.log("-----Seamless------");
    let that = this;
    var i = 0;

    setTimeout(function() {
      console.log("Call setTimeout", that.pid);
      that.modifiedfile = "file";
      that.applyBrandMapping();
    }, 10000);
  }
  applyBrandMapping() {
    this.job.progress(40, 100);
    this.job.log("-----applyBrandMapping------");
    // brand productsSpecification.xml
    let seamlessfile = this.seamlessfile;

    //apply mapping to seamless file

    this.mappedfile = "mappingfile";
    this.uploader();
  }
  uploader() {
    let that = this;
    this.job.progress(50, 100);
    this.job.log("-----Uploader------");
    setTimeout(function() {
      that.emit("done", { file: that.item.file });
    }, 10000);
    //If error
  }
}
module.exports = Uploader;
