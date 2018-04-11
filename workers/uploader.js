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
    this.upload_type = common.getUploadType(this.item.file.name);
    this.ftpclient = new FtpClient();
  }
  start() {
    var that = this;
    this.job.log("--------Start-----------");
    this.ftpclient.connect(this.item.brand.ftp);
    this.ftpclient.on("error", function(err) {
      that.emit("error", err);
    });
    // that.emit("error", { message: "Custom Error" });
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
    if (!fs.existsSync(global.__dirname + "/temp/")) {
      fs.mkdirSync(global.__dirname + "/temp/");
    }
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
    this.tempFile = brandTempDir + that.item.file.name;
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

    var getFileExt = that.item.file.name.split(".");
    getFileExt = getFileExt[getFileExt.length - 1];

    this.prevFile = path.join(
      global.__dirname,
      "prev",
      that.item.optId,
      "prevfile." + getFileExt
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
          that.uploadSeamlessFile();
        }
      }.bind(this)
    );
  }
  uploadSeamlessFile() {
    var that = this;
    let seamlessfile = this.currentRemote;
    if (fs.existsSync(this.modifiedRemote)) {
      seamlessfile = this.modifiedRemote;
    }
    this.job.log(
      "UPLOADING SEAMLESS FILE TO " +
        that.item.brand.dir.processing +
        that.item.file.name
    );
    common.uploadFile(
      that.item.brand.ftp,
      seamlessfile,
      that.item.brand.dir.processing + that.item.file.name,
      function(err) {
        if (err)
          return that.emit("error", {
            file: that.item.brand.dir.processing + that.item.file.name,
            message:
              "Error in uploading seamless file to " +
              that.item.brand.dir.processing +
              that.item.file.name
          });
        that.localUploader();
      }
    );
  }
  async uploader() {
    var that = this;
    this.job.log("Executing Catalog batch Script");
    // brand productsSpecification.xml

    var Client = require("ssh2").Client;

    var conn = new Client();
    conn
      .on("ready", function() {
        console.log("Client :: ready");
        conn.exec(
          `sh /Users/ashwini/Documents/projects/uploader/runnode.sh 10 ${
            that.item.file.name
          }`,
          function(err, stream) {
            if (err) throw err;
            stream
              .on("close", function() {
                console.log("Stream :: close");
                conn.end();
                that.emit("error", code);
              })
              .on("disconnect", function(code) {
                console.log("Stream :: disconnect");
                that.job.log(`Disconnect event`, code);
                that.emit("error", code);
              })
              .on("data", function(data) {
                console.log("STDOUT: " + data);
                that.job.log(data + "");
              })
              .stderr.on("data", function(data) {
                console.log("STDERR: " + data);
                that.job.log("STDERR: " + data);
              });
          }
        );
      })
      .connect(
        _.extend(config.ssh, {
          privateKey: require("fs").readFileSync(config.ssh.privateKeyPath)
        })
      );
  }
  async localUploader() {
    this.job.log("LOCAL UPLOADER");
    var that = this;
    const { spawn } = require("child_process");
    const sh = spawn("sh", [
      config.shScript,
      this.item.brand.OptId,
      this.item.file.name
    ]);
    sh.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
      that.job.log(data + "");
    });
    sh.stderr.on("data", data => {
      console.log(`stderr: ${data}`);
      that.job.log(`stderr: ${data}`);
    });
    sh.on("close", code => {
      that.job.log("Shell script processing done" + code);
      that.done();
      console.log(`child process exited with code ${code}`);
    });
  }
  done() {
    this.job.log("Moving file from processing to processed");
    var that = this;

    if (fs.existsSync(this.modifiedRemote)) {
      fs.unlinkSync(this.modifiedRemote);
    }
    fs
      .createReadStream(that.currentRemote)
      .pipe(fs.createWriteStream(that.prevFile));

    fs.unlinkSync(this.localFile);
    common.moveFile(
      that.item.brand.ftp,
      that.item.brand.dir.processing + that.item.file.name,
      that.item.brand.dir.processed + that.item.file.name,
      function(err) {
        if (err) {
          // that.emit('error',)
        }
        that.moveToBackup();
      }
    );
  }
  moveToBackup() {
    var that = this;
    this.job.log("MOVING FILE TO BACKUP DIR");
    common.uploadFile(
      that.item.brand.ftp,
      this.currentRemote,
      that.item.brand.dir.backup + that.item.file.name,
      function(err) {
        if (err) return that.emit("error", err);
        that.emit("done", { file: that.item.file });
      }
    );
  }
}
module.exports = Uploader;
