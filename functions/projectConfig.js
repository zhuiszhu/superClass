
const home = "localhost";
const IP = getIPAdress();

function getIPAdress(){  
    var interfaces = require('os').networkInterfaces();  
    for(var devName in interfaces){  
          var iface = interfaces[devName];  
          for(var i=0;i<iface.length;i++){  
               var alias = iface[i];  
               if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                     return alias.address;  
               }  
          }  
    }  
}
var conObj = {
    http : {
        hostname : IP,
        port : 3000
    },
    db : {
        connect : "localhost",
        port : 27017,
        dbname : "superClass"
    },
    socket : {
        connect : IP,
        port : 8000
    }
}
console.log(`http://${conObj.http.hostname}:${conObj.http.port}`);

module.exports = conObj;