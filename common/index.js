const fs = require("fs"),
  csv = require("csvtojson");
let seamless = async function(item, file, cb) {
  /*
     item = {
         brand,
         file,
         optId
     }

    */
   cb = cb || function(){}
   var currentRemote = this.localFile,
     pervFilePath = this.prevFile;
   if (!fs.existsSync(prevFile)) {
     this.job.log("-- Prev File not exist to compare----");
     return cb();
   }
   try {
     var prevFileData = await getJSON(pervFilePath);
     var currentFileData = await getJSON(currentRemote);
     var diffItems = [];
     let columnHeaders = currentFileData[0];
     currentFileData.shift();
     currentFileData.forEach(function(currentObj, index) {
       var findings = _.findWhere(prevFileData, currentObj);
       if (!findings) {
         diffItems.push(currentObj);
       }
     });
 
     if (diffItems.length) {
       let finalStr = columnHeaders + "\n";
       diffItems = diffItems.map(function(obj) {
         var csvstr = obj;
         csvstr = csvstr.map(function(data) {
           if (data.indexOf(",") > -1) {
             let test1 = data.split('"').join('""');
             let test = '"' + test1 + '"';
             return test;
           }
           if (data.indexOf('"') > -1) {
             let test1 = data.split('"').join('""');
             let test = '"' + test1 + '"';
             return test;
           }
           return data;
         });
         finalStr += csvstr + "\n";
       });
       fs.writeFileSync(that.modifiedRemote, finalStr);
       return cb(true);
     } else {
       return cb(false);
     }
   } catch (e) {
     console.log("Exception", e);
     return cb(false);
   }  
};

function getJSON(filePath, cb) {
  return new Promise(function(resolve, reject) {
    // Do async job
    var array = [];
    csv({ noheader: true })
      .fromFile(filePath)
      .on("csv", csvRow => {
        array.push(csvRow);
      })
      .on("done", error => {
        if (error) {
          reject(error);
        } else {
          resolve(array);
        }
      });
  });
}
module.exports = {
  seamless
};
