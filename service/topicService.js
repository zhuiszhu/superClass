var DBCon = require("../db/DBconnect.js");
var userDB = new DBCon("users");
var topicDB = new DBCon("topic");
var sTTDB = new DBCon("studentToTopic");
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
            var topicID = null;
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

                    if(data.collection == "topic" && data.oop == "insert"){//对题目表的插入操作成功

                        topicID = data.info.insertedIds[0];


                        userDB.find({class : userObj.class , type : "1"},{_id : 1});

                    }else if(data.collection == "users" && data.oop == "find"){//对用户列表的查询操作成功
                        // console.log(data.info);
                        var userList = data.info;
                        if(topicID != null){//题目添加成功了才能添加关系表内容
                            var dataList = userList.map(function(item , index){
                                return {
                                    studentID : item._id,
                                    result : 0,
                                    topicID : topicID,
                                    replyTime : null,
                                    class : userObj.class,
                                    fraction : topicObj.fraction,
                                    state : false
                                }
                            });
                            sTTDB.insert(dataList);
                        }
                    }else if(data.collection == "studentToTopic" && data.oop == "insert"){//学员题目关系表数据插入成功
                        sendObj.aut = true;
                        sendObj.txt = "添加成功";
                        res.json(sendObj);
                        
                    }
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