module.exports = {
  opt: {
    endpoint: "http://sunilmore-rest-api.herokuapp.com"
  },
  supportedFileFormat:['.csv','.xlsx','.xml'],
  redis: {
    prefix: "catalogbatch",
    redis: {
      port: 6379,
      host: "localhost",

      db: 3 // if provided select a non-default redis db
    }
  },
  shScript: "sh /Users/sunilmore/Documents/projects/uploader/runnode.sh ",
  ssh: {
    host: "ec2-54-186-176-189.us-west-2.compute.amazonaws.com",
    port: 22,
    username: "ec2-user",
    privateKeyPath: "/Users/sunilmore/Downloads/sunilaws_private.pem"
  },
  brands: [
    // {
    //   optId: "1",
    //   name: "Brand1",
    //   priority: "normal",
    //   ftp: {
    //     host: "ftp.filezapp.com",
    //     port: 21,
    //     user: "mallinath@filezapp.com",
    //     password: "malli123",
    //     pass: "malli123"
    //   },
    //   dir: {
    //     upload: "/upload/",
    //     enqueued: "/enqueued/",
    //     processing: "/processing/",
    //     error: "/error/",
    //     processed: "/processed/",
    //     ignore:"/ignore/",
    //   }
    // },
    {
      optId: "2",
      name: "Brand2",
      priority: "normal",
      xml: {
        parentTag: "stockFile.stockItem"
      },
      ftp: {
        host: "ftp.filezapp.com",
        port: 21,
        user: "sunil@filezapp.com",
        password: "Laxman_usha90",
        pass: "Laxman_usha90"
      },
      dir: {
        upload: "/uploadrewrite/2/upload/",
        enqueued: "/uploadrewrite/2/enqueued/",
        processing: "/uploadrewrite/2/processing/",
        error: "/uploadrewrite/2/error/",
        processed: "/uploadrewrite/2/processed/",
        ignore: "/uploadrewrite/2/ignore/",
        backup:"/uploadrewrite/2/backup/"
      }
    }
  ]
};
