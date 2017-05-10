var DBCon = require("../db/DBconnect.js");
var userDB = new DBCon("users");
var topicDB = new DBCon("topic");
var event = require("../functions/publicEvent");
var getSocketUser = require("../service/socketService");

var topicService = {
    insertTopic : (req , res) => {
        event.emit("GET_RES", res);

        var sendObj = {
            aut : false
        }

        if (req.session.userObj && req.session.userObj[0].type == 0){//讲师身份,可以添加问题
            var userObj = req.session.userObj[0];
            var topicObj = req.body;
            topicObj.title = topicObj.title.trim();
            topicObj.content = topicObj.content.trim();
            topicObj.fraction = topicObj.fraction*1;

            if(!topicObj.title){
                sendObj.txt = "标题不能为空!";
                res.json(sendObj);
            }else if(!topicObj.content){
                sendObj.txt = "内容不能为空!";
                res.json(sendObj);                  
            }else if(isNaN(topicObj.fraction)){
                sendObj.txt = "题目分数有误!";
                res.json(sendObj);   
            }else{//格式正确,可以提交
                topicObj.date = new Date();
                topicObj.class = userObj.class;
                if(topicObj.fraction == 0){
                    topicObj.fraction = 2;
                }

                event.removeAllListeners("DB_OOP_SUCCESS");
                event.on("DB_OOP_SUCCESS" , data => {
                    sendObj.aut = true;
                    sendObj.txt = "添加成功";

                    res.json(sendObj);
                });

                topicDB.insert(topicObj);
            }

        }else{
            sendObj.txt = "权限不足!仅讲师账号可添加提问!";
            res.json(sendObj);
        }
    }
};

/**
 * 验证问题标题以及内容是否合法
 * @param {string} text 需要验证的文本内容
 */
var testText = text => {
    var zz = /\w{4,20}/;
    return zz.test(text);
}

module.exports = topicService;