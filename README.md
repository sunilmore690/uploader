# Uploader


Uploader is used for process the catalog files for brand and upload the products to database.Uploader process consist following steps

  - Manager - Monitor upload Dir for each brand and add files into  Queue to process
  - Processor - Process the Catalog File from Queue
  
 In processor , we're doing following steps
  - Seamless - we compare with prev file and pass only changed data to next step otherwise, we  don't process the file
  - Mapping - Apply mapping rule specific to brannch  and proceeed this file to uploader
  - Uploader - Call OPT endpoint to add/modify/delete product data for each product


# Queue Managment
  We're using 2 queues for managing uploader
  - brandmanagerqueue - This queue used to get catalog files from ftp Dir and add individual file to catalogbatchqueue
  - catalogbatchqueue - This queue used to process single catalog file for brand,now 4 files are processing parallely 


### Tech

Dillinger uses a number of open source projects to work properly:

* [kue](https://www.npmjs.com/package/kue) - Kue is a priority job queue backed by redis, built for node.js.
* [async](https://caolan.github.io/async/) - Async is a utility module which provides straight-forward, powerful functions for working with asynchronous JavaScript.
* [cron](https://www.npmjs.com/package/cron) - Cron for Nodejs
* [node.js] - evented I/O for the backend


And of course Dillinger itself is open source with a [public repository][dill]
 on GitHub.

### Installation

Uploader requires [Node.js](https://nodejs.org/) v7.9.0+ to run.

Install the dependencies and devDependencies and start the server.

```sh
$ cd uploader
$ npm install 
$ node index.js
```


### Plugins

Uploader required redis to be installed on Server

 Redis installation steps on Centos - https://linode.com/docs/databases/redis/install-and-configure-redis-on-centos-7/





