let queue = require("../initializers/queue");
const axios = require("axios");
const config = require("config");
module.exports = function() {
  queue.process("email",2, async function(job, ctx, done) {
    job.log("Sending Email");
    let data = job.data;
    const brand = data.brand;
    const file = data.file;
    const err = data.err;
    let url = config.opt.endpoint + "/email";
    axios
      .post(url, data)
      .then(function(response) {
        done(null, response);
      })
      .catch(function(error) {
        done(error);
      });
  });
};
