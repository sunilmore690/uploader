var kue = require("kue"),
    config = require('config'),
  queue = kue.createQueue(config.redis);
module.exports = queue;