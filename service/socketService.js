var WebSocketServer = require("ws").Server;
var pjtObj = require("../functions/projectConfig").socket;
var socket = new WebSocketServer({ port: pjtObj.port , host : pjtObj.connect });
var clientMap = {};//用户连接池
var teaClient = null;//教师客户端
var userObj = null;//用户信息
var event = require("../functions/publicEvent");

socket.on("connection", client => {

    if (userObj) {//用户session存在,即用户登录过,允许连接
        delete userObj.password;
        delete userObj.friends;

        if(userObj.type == 0){//教师连接
            client.userObj = userObj;
            teaClient = client;
            
        }else{//学员连接
            client.userObj = userObj;
            clientMap[userObj._id] = client;
            event.emit(userObj._id);//通知classService 该学员已上线
        }

        //只要教师在线,就更新学员列表
        if(teaClient != null){
            sendUserList();//更新学员上线列表
        }

        userObj = null;


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

            if(client.userObj.type == 0){//教师端下线
                teaClient = null;
            }else{
                delete clientMap[client.userObj._id];//更新学员列表
                sendUserList();//向教师端更新学员列表
            }

        });

        client.on("error", err => {
            console.log("socket连接异常,信息如下:");
            console.log(err);
        });
    } else {//用户不存在,不允许连接
        console.log("socket连接错误,用户未登录");
    }

});
/*
module.exports = sessionObj => {
    userObj = sessionObj;
};*/

var emitAll = data => {
    for (var i in clientMap) {
        clientMap[i].send(data);
    }
}

/**
 * 统计在线学员数量
 */
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

/**
 * 向教师客户端更新学员列表
 */
var sendUserList = () => {

    if(teaClient != null){//教师在线时,向客户端发送学员列表
        var userList = [];

        for(var i in clientMap){
            var userObj = clientMap[i].userObj;
            userList.push(userObj);
        }

        var message = {
            type : "USER_LIST",
            content : userList
        }

        teaClient.send(JSON.stringify(message));
    }
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

/**
 * 发送题目给指定的学员
 * @param {string} aimsID :信息接收者id
 * @param {object} topicObj : 要发送的题目
 */
var sendTopicToUser = (aimsID , topicObj) => {
    var sendObj = {
        type : "TOPIC",
        content : topicObj
    }

    clientMap[aimsID].send(JSON.stringify(sendObj));
}

/**
 * 发送答题状态给讲师
 * @param {object} studentToTopic : 要发送的题目学员关系对象
 */
var sendReply = (studentToTopic) => {

    if(teaClient != null){
        var sendObj = {
            type : "REPLY",
            content : studentToTopic
        }

        teaClient.send(JSON.stringify(sendObj));
    }
}

/**
 * 向全体在线学员发送题目
 * @param {object} topicObj 题目对象,包含题目id,题目标题,题目内容,题目分数等
 */
var sendTopic = topicObj => {
    var sendObj = {
        type : "TOPIC",
        content : topicObj
    }

    emitAll(JSON.stringify(sendObj));
}
module.exports = {
    sendSessionObj : sessionObj => {
        userObj = sessionObj;
    },
    sendTopic : sendTopic,
    sendTopicToUser :sendTopicToUser,
    sendReply : sendReply
}