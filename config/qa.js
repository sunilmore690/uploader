module.exports = {

    opt:{
      endpoint:'http://optqa.optcentral.com'
    },
    redis: {
      prefix: "uploadrewrite-qa",
      redis: {
        port: 11000,
        host: "node2064-hw-redis-staging.jelastic.optcentral.com",
        auth: 'YKAcvx61829',
        db: 3 
      }
    },
    ssh:{
      host: "ec2-54-186-176-189.us-west-2.compute.amazonaws.com",
      port: 22,
      username: "ec2-user",
      privateKeyPath: "/path/to/private/pem/file"
    },
    shScript:"/home/opt/standalone/runXCD.sh",
    brands: [
      {
        optId: "2086",
        name: "Assael",
        priority: "normal",
        ftp: {
          host: "node2331-qa-opt-standalone.jelastic.optcentral.com",
          port: 11021,
          user: "opt-dev",
          password: "OptJelastic2017",
          pass: "OptJelastic2017"
        },
        dir: {
          upload: "/home/opt/uploader_rewrite/Assael_Catalog_Feed",
          enqueued: "/home/opt/uploader_rewrite/Assael_Catalog_Feed/enqueued/",
          processing: "/home/opt/uploader_rewrite/Assael_Catalog_Feed/processing/",
          error: "/home/opt/uploader_rewrite/Assael_Catalog_Feed/error/",
          processed: "/home/opt/uploader_rewrite/Assael_Catalog_Feed/output/",
          ignore:"/home/opt/uploader_rewrite/Assael_Catalog_Feed/ignore/",
          backup:"/home/opt/uploader_rewrite/Assael_Catalog_Feed/backup/",
        }
      },
      
    ],
  
  };
  