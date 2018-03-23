module.exports = {
  brands: [
    {
      optId: "1",
      name: "Brand1",
      priority: "normal",
      ftp: {
        host: "ftp.filezapp.com",
        port: 21,
        user: "sunil@filezapp.com",
        password: "Laxman_usha90",
        pass: "Laxman_usha90"
      },
      mapping:{
        ['Style#']:'PRODUCT',
        'Category Name':'Category',
        ['Collection Name']:'Collections',
        imageName:'ImagePath',
        ['Wholesale Price']:'Price'
      },
      dir: {
        upload: "/uploadrewrite/1/upload/",
        enqueued: "/uploadrewrite/1/enqueued/",
        processing: "/uploadrewrite/1/processing/",
        error: "/uploadrewrite/1/error/",
        processed: "/uploadrewrite/1/processed/",
        ignore:"/uploadrewrite/1/ignore/",
      }
    },
    {
      optId: "2",
      name: "Brand2",
      priority: "normal",
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
        processed: "/uploadrewrite/2/processed/"
      }
    },
    {
      optId: "3",
      name: "Brand3",
      priority: "normal",
      ftp: {
        host: "ftp.filezapp.com",
        port: 21,
        user: "sunil@filezapp.com",
        password: "Laxman_usha90",
        pass: "Laxman_usha90"
      },
      dir: {
        upload: "/uploadrewrite/3/upload/",
        enqueued: "/uploadrewrite/3/enqueued/",
        processing: "/uploadrewrite/3/processing/",
        error: "/uploadrewrite/3/error/",
        processed: "/uploadrewrite/3/processed/"
      }
    },
    {
      optId: "4",
      name: "Brand4",
      priority: "normal",
      ftp: {
        host: "ftp.filezapp.com",
        port: 21,
        user: "sunil@filezapp.com",
        password: "Laxman_usha90",
        pass: "Laxman_usha90"
      },
      dir: {
        upload: "/uploadrewrite/4/upload/",
        enqueued: "/uploadrewrite/4/enqueued/",
        processing: "/uploadrewrite/4/processing/",
        error: "/uploadrewrite/4/error/",
        processed: "/uploadrewrite/4/processed/"
      }
    },
    {
      optId: "5",
      name: "Brand5",
      priority: "high",
      ftp: {
        host: "ftp.filezapp.com",
        port: 21,
        user: "sunil@filezapp.com",
        password: "Laxman_usha90",
        pass: "Laxman_usha90"
      },
      dir: {
        upload: "/uploadrewrite/5/upload/",
        enqueued: "/uploadrewrite/5/enqueued/",
        processing: "/uploadrewrite/5/processing/",
        error: "/uploadrewrite/5/error/",
        processed: "/uploadrewrite/5/processed/"
      }
    },
    {
      optId: "6",
      name: "Brand6",
      priority: "normal",
      ftp: {
        host: "ftp.filezapp.com",
        port: 21,
        user: "sunil@filezapp.com",
        password: "Laxman_usha90",
        pass: "Laxman_usha90"
      },
      dir: {
        upload: "/uploadrewrite/6/upload/",
        enqueued: "/uploadrewrite/6/enqueued/",
        processing: "/uploadrewrite/6/processing/",
        error: "/uploadrewrite/6/error/",
        processed: "/uploadrewrite/6/processed/"
      }
    }
  ],
  opt:{
    endpoint:'http://sunilmore-rest-api.herokuapp.com/api/users'
  },
  redis: {
    prefix: "catalogbatch",
    redis: {
      port: 6379,
      host: "localhost",
      // auth: 'password',
      db: 3 // if provided select a non-default redis db
    }
  }
};
