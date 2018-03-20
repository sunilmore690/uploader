module.exports = {
  redis: {
    prefix: "catalogbatch",
    redis: {
      port: 6379,
      host: "127.0.0.1",
      // auth: 'password',
      db: 3 // if provided select a non-default redis db
    }
  }
};
