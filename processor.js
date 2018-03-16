
let events = require('events');
class Processor extends events {
    constructor(pid) {
      console.log('pid',pid)
      super()
      this.isRunning = false;
      this.pid= pid
    }
    start(item,job,cb){
        this.job = job;
        this.cb = cb|| function(){}
        console.log('item',item)
        this.item = item;
        this.downloadFileFromFtp()
        
    }
    downloadFileFromFtp(){
        console.log('--Downloading File From Ftp',this.pid)
        
        this.seamless()
    }
    seamless(){
        console.log('-----Seamless------',this.pid)
        let that = this;
        var i = 0;
        var myVar = setInterval(function(){that.job.log('sending!'+i);i++;that.job.progress(i,300) },1000);
        setTimeout(function(){
            clearInterval(myVar);
            console.log('Call setTimeout',that.pid)
            that.modifiedfile = 'file'
            that.applyBrandMapping()
        },100000)
    }
    applyBrandMapping(){
        console.log('-----applyBrandMapping----',this.pid)
        // brand productsSpecification.xml
        let seamlessfile = this.seamlessfile;
        
        //apply mapping to seamless file

        this.mappedfile = 'mappingfile'
        this.uploader()

    }
    uploader(){
        console.log('---Calling uploader-----')

        //done uploader
        this.cb()
        this.emit('done',{file:this.item.file,pid:this.pid})

        //If error
        this.emit('error')
    }

}
module.exports = Processor