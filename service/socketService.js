var WebSocketServer = require("ws").Server;
var pjtObj = require("../functions/projectConfig").socket;
var socket = new WebSocketServer({ port: pjtObj.port , host : pjtObj.connect });
var clientMap = {};//用户连接池
var userObj = null;//用户信息

socket.on("connection", client => {

    if (userObj) {//用户session存在,即用户登录过,允许连接
        delete userObj.password;
        delete userObj.friends;

        client.userObj = userObj;
        clientMap[userObj._id] = client;
        userObj = null;

        sendUserList();//更新用户列表

        client.on("message", data => {
            // console.log(data);
            var dataObj = JSON.parse(data);

            switch(dataObj.type){
                case "MESSAGE":
                    if(dataObj.sendObj.id){//拥有目标才能进行数据转发
                        sendMessage(dataObj.sendObj.id , dataObj.content , client.userObj._id);
                    }
                    break;
            }
        });

        client.on("close", () => {
            console.log("连接被关闭了");
            delete clientMap[client.userObj._id];
            sendUserList();//更新用户列表
        });

        client.on("error", err => {
            console.log("socket连接异常,信息如下:");
            console.log(err);
        });
    } else {//用户不存在,不允许连接
        console.log("socket连接错误,用户未登录");
    }

});

module.exports = sessionObj => {
    userObj = sessionObj;
};

var emitAll = data => {
    for (var i in clientMap) {
        clientMap[i].send(data);
    }
}

var getClientNum = () => {
    var count = 0;
    for (var i in clientMap) {
        count++;
    }
    return count;
}

var sendUserNum = () => {
    var num = getClientNum();
    var data = {
        type: "USER_NUMBER",
        content: num
    }

    emitAll(JSON.stringify(data));
}

var sendUserList = () => {
    var userList = [];

    for(var i in clientMap){
        var userObj = clientMap[i].userObj;
        userList.push(userObj);
    }

    var message = {
        type : "USER_LIST",
        content : userList
    }

    emitAll(JSON.stringify(message));
}
/**
 * 发送信息给指定的用户
 * @param {string} aimsID :信息接收者id
 * @param {string} message : 要发送的消息
 * @param {string} sendID : 发送者id
 */
var sendMessage = (aimsID , message , sendID) => {
    var sendObj = {
        type : "MESSAGE",
        content : message,
        sendID : sendID
    }

    clientMap[aimsID].send(JSON.stringify(sendObj));
}
