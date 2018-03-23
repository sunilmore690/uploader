const fs = require("fs"),
  csv = require("csvtojson");
  FtpClient = require("ftp"),
  _ = require('underscore')
let seamless = async function(item, file, cb) {
  /*
     item = {
         brand,
         file,
         optId
     }

    */
   let that = this;
  cb = cb || function() {};
  var currentRemote = this.localFile,
    pervFilePath = this.prevFile;
  if (!fs.existsSync(pervFilePath)) {
    this.job.log("-- Prev File not exist to compare----");
    return cb(true);
  }
  try {
    console.log('pervFilePath',pervFilePath)
    console.log('currentRemote',currentRemote)
    var prevFileData = await getJSON(pervFilePath);
    var currentFileData = await getJSON(currentRemote);
    var diffItems = [];
    let columnHeaders = currentFileData[0];
    var modifiedStream = fs.createWriteStream(that.modifiedRemote, {
      // flags: 'a' // 'a' means appending (old data will be preserved)
    });
    modifiedStream.write(columnHeaders + "\n");
    currentFileData.shift();
    currentFileData.forEach(function(line, index) {
      console.log('line',line)
      // var findings = _.find(prevFileData, line);
      if (prevFileData.indexOf(line)  < 0) {
        diffItems.push(line);
        modifiedStream.write(line + "\n");
      }
    });
    modifiedStream.end();
    console.log('diffitems',diffItems)
    if (diffItems.length) {
      // fs.writeFileSync(that.modifiedRemote, finalStr);
      return cb(true);
    } else {
      return cb(false);
    }
  } catch (e) {
    console.log("Exception", e);
    return cb(false);
  }
};
let csvToJSON = function(filePath, cb) {
  console.log('csvToJSON',filePath)
  return new Promise(function(resolve, reject) {
   console.log('callling csvtojson')
    // Do async job
    var array = [];
    csv()
      .fromFile(filePath)
      .on("json", jsonRow => {
        console.log('jsonrow',jsonRow)
        array.push(jsonRow);
      })
      .on("done", error => {
        if (error) {
          reject(error);
        } else {
          resolve(array);
        }
      });
  });
};
function getJSON(filePath, cb) {
  console.log('filePath',filePath)
  return new Promise(function(resolve, reject) {
    var lineReader = require("readline").createInterface({
      input: require("fs").createReadStream(filePath)
    });
    var array = []
    lineReader.on("line", function(line) {
      // console.log('Line from file:', line);
      array.push(line);
    });
    lineReader.on("close", function() {
      console.log(array);
      resolve(array);
    });
    // Do async job
    // var array = [];
    // csv({ noheader: true })
    //   .fromFile(filePath)
    //   .on("csv", csvRow => {
    //     array.push(csvRow);
    //   })
    //   .on("done", error => {
    //     if (error) {
    //       reject(error);
    //     } else {
    //       resolve(array);
    //     }
    //   });
  });
}
let moveFile = function(ftpobj,src,dest,cb){
  cb = cb || function(){}
  var c = new FtpClient();
  c.on('ready', function() {
    c.rename(src, dest, function(err) {
      if (err) cb(err)
      c.end();
      cb()
    });
  });
  // connect to localhost:21 as anonymous
  c.connect(ftpobj);

}
module.exports = {
  seamless,
  csvToJSON,
  moveFile
};