let events = require("events"),
  FtpClient = require("ftp"),
  fs = require("fs"),
  common = require('../common');
class Uploader extends events {
  constructor(item, job) {
    super();
    this.item = item;
    this.job = job;
    this.isRunning = false;
    this.ftpclient = new FtpClient();
  }
  start() {
    this.job.log("--------Start-----------");
    this.ftpclient.connect(this.item.brand.ftp);
    this.moveFileToProcessingDir();
  }
  moveFileToProcessingDir() {
    console.log(this.item)
    this.job.log("--------moveFileToProcessingDir-----------");
    var brand = this.item.brand,
      file = this.item.file,
      that = this;
    this.job.progress(10, 100);
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
          that.emit("error", err);
          return;
        }
        that.downloadFileFromFtp();
      }
    );
    // this.downloadFileFromFtp();
  }
  downloadFileFromFtp() {
    this.job.log("------- downloadFileFromFtp ------- ");
    this.job.progress(30, 100);
    let that = this;
    let brandTempDir = "../temp/" + this.item.brand.optId + "/";
    if (!fs.existsSync(brandTempDir)) {
      fs.mkdirSync(brandTempDir);
    }
    this.localFile = "./temp/" + this.item.brand.optId + "/"+that.item.file.name
    this.ftpclient.get(
      this.item.brand.dir.processing + this.item.file.name,
      function(err, stream) {
        that.ftpclient.end();
        console.log("error", err);
        if (err) return that.emit("error", err);
        stream.once("close", function() {
          that.ftpclient.end();
          that.seamless();
        });
        readable.on("data", chunk => {
          console.log(`Received ${chunk.length} bytes of data.`);
        });
        stream.pipe(fs.createWriteStream(brandTempDir + that.item.file.name));
      }
    );
  }
  seamless() {
    this.job.progress(40, 100);
    this.job.log("----- Seamless ------", this.pid);
    let that = this;
    var i = 40;

    
    this.prevFile = path.join(global.__dirname,'prev',that.item.optId,'prevfile');
    this.currentRemote = this.localFile;
    this.modifiedRemote = path.join(global.__dirname,'temp',that.item.optId + 'mod-'+that.item.file.name);
    console.log('prevfile',this.prevFile);
    
    common.seamless.call(this,this.item,this.localFile,function(isDifferentFile){
      if(!isDifferentFile){
        common.moveFile(that.item.brand.ftp,that.item.brand.dir.processing + that.item.file.name,that.item.brand.dir.ignore + that.item.file.name,function(err){
          if(err){

            return 
          }
          return that.emit('done',{brand:that.item.brand})

        })
      }else{
        that.applyBrandMapping()
      }
      
    }.bind(this)) 
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
    this.emit("done", { file: this.item.file});
  }
}
module.exports = Uploader;
