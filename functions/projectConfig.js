
const home = "localhost";
const cr = "192.168.59.208"
const IP = cr;

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

module.exports = conObj;