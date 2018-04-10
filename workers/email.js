let queue = require("../initializers/queue");
const request = require("request");
const config = require("config");
module.exports = function () {
  queue.process("email", 2, async function (job, ctx, done) {
    job.log("Sending Email");

    let data = job.data;
    const brand = data.brand;
    const file = data.file;
    const err = typeof data.err == 'object' ? JSON.stringify(data.err) : data.err;
    const comp_id = data.brand.optId;

    let url = config.opt.endpoint + "/email";

    request({
      url: url,
      method: 'POST',
      json: true,
      body: {
        comp_id: comp_id,
        body: '<html><b>There is some issues in file uploadig, following are details</b></br> <p>company name: ' + comp_id + '</br> file name: ' + file + '</br>error:' + err + '</br></p></html>',
        subject:"Catalog Batch Run Issue for CompanyId " +comp_id
      }
    }, (error, response, body) => {
      if (error) {
        done(error);
      } else {
        done(null, response)
      }
    });
  });
};