let events = require("events"),
  FtpClient = require("ftp"),
  fs = require("fs"),
  common = require("../common"),
  path = require("path"),
  async_lib = require("async"),
  config = require("config"),
  axios = require("axios");
class Uploader extends events {
  constructor(item, job) {
    super();
    this.producterrors = [];
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
    console.log(this.item);
    this.job.log("--------moveFileToProcessingDir-----------");
    var brand = this.item.brand,
      file = this.item.file,
      that = this;
    this.job.progress(10, 100);
    this.ftpclient.rename(
      brand.dir.enqueued + file.name,
      brand.dir.processing + file.name,
      function(err) {
        // that.ftpclient.end();
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
    let brandTempDir =
      global.__dirname + "/temp/" + this.item.brand.optId + "/";
    if (!fs.existsSync(brandTempDir)) {
      fs.mkdirSync(brandTempDir);
    }
    if (!fs.existsSync(path.join(global.__dirname, "prev"))) {
      fs.mkdirSync(path.join(global.__dirname, "prev"));
    }
    this.job.log("brandTempdir", brandTempDir);
    this.job.log(
      "localfile",
      global.__dirname +
        "/temp/" +
        this.item.brand.optId +
        "/" +
        that.item.file.name
    );
    this.localFile =
      global.__dirname +
      "/temp/" +
      this.item.brand.optId +
      "/" +
      that.item.file.name;
    this.ftpclient.get(
      this.item.brand.dir.processing + this.item.file.name,
      function(err, stream) {
        // that.ftpclient.end();
        console.log("error", err);
        if (err) return that.emit("error", err);
        stream.once("close", function() {
          that.ftpclient.end();
          that.seamless();
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

    this.prevFile = path.join(
      global.__dirname,
      "prev",
      that.item.optId,
      "prevfile.csv"
    );
    this.currentRemote = this.localFile;
    this.modifiedRemote = path.join(
      global.__dirname,
      "temp",
      that.item.optId +
        "mod-" +
        that.item.brand.optId +
        "-" +
        that.item.file.name
    );
    console.log("prevfile", this.prevFile);
    if (!fs.existsSync(path.join(global.__dirname, "prev", that.item.optId))) {
      fs.mkdirSync(path.join(global.__dirname, "prev", that.item.optId));
    }
    common.seamless.call(
      this,
      this.item,
      this.localFile,
      function(isDifferentFile) {
        if (!isDifferentFile) {
          that.job.log("--Duplicate File found, moving to ignore dir");
          common.moveFile(
            that.item.brand.ftp,
            that.item.brand.dir.processing + that.item.file.name,
            that.item.brand.dir.ignore + that.item.file.name,
            function(err) {
              if (err) {
                return that.emit("error", err);
              }

              return that.emit("done", { brand: that.item.brand });
            }
          );
        } else {
          that.uploader();
        }
      }.bind(this)
    );
  }
  async uploader() {
    var that = this;
    this.job.log("-----applyBrandMapping----", this.pid);
    // brand productsSpecification.xml
    let seamlessfile = this.currentRemote;
    if (fs.existsSync(this.modifiedRemote)) {
      seamlessfile = this.modifiedRemote;
    }
    var productsData = [];
    try {
      productsData = await common.csvToJSON(seamlessfile);
    } catch (e) {
      return that.emit("error", e);
    }
    var Client = require("ssh2").Client;
    var productsCount = productsData.length;
    var conn = new Client();
    conn
      .on("ready", function() {
        console.log("Client :: ready");
        conn.exec("sh runnode.sh 10", function(err, stream) {
          if (err) throw err;
          stream
            .on("close", function() {
              console.log("Stream :: close");
              conn.end();
              that.done()
            })
            .on("data", function(data) {
                console.log('STDOUT: ' + data);
              that.job.log(data + "");
            })
            .stderr.on("data", function(data) {
              console.log("STDERR: " + data);
            });
        });
      })
      .connect(_.extend(config.ssh,{privateKey:require("fs").readFileSync(config.ssh.privateKeyPath)}))
  }
  done() {
    this.job.log('Moving file fro processing to processed')
    var that = this;
    fs
      .createReadStream(that.currentRemote)
      .pipe(fs.createWriteStream(that.prevFile));
    common.moveFile(
      that.item.brand.ftp,
      that.item.brand.dir.processing + that.item.file.name,
      that.item.brand.dir.processed + that.item.file.name,
      function(err) {
        if (err) {
        }
        that.emit("done", { file: that.item.file });
      }
    );
  }
}
module.exports = Uploader;
