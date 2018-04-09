module.exports = {

    opt:{
      endpoint:'http://optqa.optcentral.com'
    },
    redis: {
      prefix: "uploadrewrite",
      redis: {
        port: 11000,
        host: "node2064-hw-redis-staging.jelastic.optcentral.com",
        auth: 'YKAcvx61829',
        db: 3 // if provided select a non-default redis db
      }
    },
    ssh:{
      host: "ec2-54-186-176-189.us-west-2.compute.amazonaws.com",
      port: 22,
      username: "ec2-user",
      privateKeyPath: "/Users/sunilmore/Downloads/sunilaws_private.pem"
      
    },
    shScript:"/home/opt/standalone/runXCD.sh",
    brands: [
      {
        optId: "3",
        name: "Kwiat",
        priority: "normal",
        ftp: {
          host: "feeds2.optcentral.com",
          port: 21,
          user: "user",
          password: "password",
          pass: "password"
        },
        dir: {
          upload: "/Kwiat_Catalog_Data_Feed/",
          enqueued: "/Kwiat_Catalog_Data_Feed/enqueued/",
          processing: "/Kwiat_Catalog_Data_Feed/processing/",
          error: "/Kwiat_Catalog_Data_Feed/error/",
          processed: "/Kwiat_Catalog_Data_Feed/processed/",
          ignore:"/Kwiat_Catalog_Data_Feed/ignore/",
          backup:"/Kwiat_Catalog_Data_Feed/backup/",
        }
      },
      
    ],
  
  };
  