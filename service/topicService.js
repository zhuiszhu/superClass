var DBCon = require("../db/DBconnect.js");
var ObjectID = require("objectid");
var userDB = new DBCon("users");
var topicDB = new DBCon("topic");
var sTTDB = new DBCon("studentToTopic");
var event = require("../functions/publicEvent");
var getSocketUser = require("../service/socketService");
var state = require("./projectState.js");
var async = require("async");

var topicService = {
    insertTopic: (req, res) => {//讲师出题
        event.emit("GET_RES", res);

        var sendObj = {
            aut: false
        }

        if (req.session.userObj && req.session.userObj[0].type == 0) {//讲师身份,可以添加问题
            var userObj = req.session.userObj[0];
            var topicObj = req.body;
            var topicID = null;
            topicObj.title = topicObj.title.trim();
            topicObj.content = topicObj.content.trim();
            topicObj.fraction = topicObj.fraction * 1;

            if (!topicObj.title) {
                sendObj.txt = "标题不能为空!";
                res.json(sendObj);
            } else if (!topicObj.content) {
                sendObj.txt = "内容不能为空!";
                res.json(sendObj);
            } else if (isNaN(topicObj.fraction)) {
                sendObj.txt = "题目分数有误!";
                res.json(sendObj);
            } else {//格式正确,可以提交
                topicObj.date = new Date();
                topicObj.class = userObj.class;
                if (topicObj.fraction == 0) {
                    topicObj.fraction = 2;
                }

                event.removeAllListeners("DB_OOP_SUCCESS");
                event.on("DB_OOP_SUCCESS", data => {

                    if (data.collection == "topic" && data.oop == "insert") {//对题目表的插入操作成功

                        topicID = data.info.insertedIds[0];

                        userDB.find({ class: userObj.class, type: "1" }, { _id: 1 });

                    } else if (data.collection == "users" && data.oop == "find") {//对用户列表的查询操作成功
                        // console.log(data.info);
                        var userList = data.info;
                        if (topicID != null) {//题目添加成功了才能添加关系表内容
                            var dataList = userList.map(function (item, index) {
                                return {
                                    studentID: item._id,
                                    result: 0,
                                    topicID: topicID,
                                    replyTime: null,
                                    class: userObj.class,
                                    fraction: topicObj.fraction,
                                    state: false,
                                    title: topicObj.title,
                                    content: topicObj.content,
                                    replyContent: null
                                }
                            });
                            sTTDB.insert(dataList);
                        }
                    } else if (data.collection == "studentToTopic" && data.oop == "insert") {//学员题目关系表数据插入成功
                        sendObj.aut = true;
                        sendObj.txt = "添加成功";
                        res.json(sendObj);
                        getSocketUser.sendTopic(topicObj);//向学员发送数据
                        state.topicState = topicObj;//提问状态管理
                    }
                });

                topicDB.insert(topicObj);
            }

        } else {
            sendObj.txt = "权限不足!仅讲师账号可添加提问!";
            res.json(sendObj);
        }
    },
    replyTopic: (req, res) => {//学生答题
        event.emit("GET_RES", res);
        var sendObj = {
            aut: false
        }

        if (req.session.userObj && req.session.userObj[0].type == 1) {//学员身份,可以回答问题
            var userObj = req.session.userObj[0];
            var topicObj = req.body;
            topicObj.content = topicObj.content.trim();

            if (!topicObj.content) {
                sendObj.txt = "内容不能为空!";
                res.json(sendObj);
            } else {
                var tid = ObjectID(topicObj.topicId);
                var uid = ObjectID(userObj._id);

                event.removeAllListeners("DB_OOP_SUCCESS");
                event.on("DB_OOP_SUCCESS", data => {
                    if (data.collection == "studentToTopic" && data.oop == "find") {//查询该题
                        var sttObj = data.info[0];

                        if (data.info.length != 0) {
                            if (sttObj.state) {//将答题后的状态发送给讲师
                                getSocketUser.sendReply(sttObj);
                            } else {
                                var sttId = data.info[0]._id;
                                sTTDB.update({ _id: sttId }, { replyTime: new Date(), state: true, replyContent: topicObj.content });
                            }
                        } else {
                            sendObj.txt = "您未被添加该题目!";
                            res.json(sendObj);
                        }
                    } else if (data.collection == "studentToTopic" && data.oop == "update") {//更新成功

                        if (data.info.result.n >= 1) {//更新成功
                            sendObj.aut = true;
                            sendObj.txt = "提交成功!";
                            sTTDB.find({ studentID: uid, topicID: tid });
                        } else {
                            sendObj.aut = false;
                            sendObj.txt = "数据更新失败!请联系管理员";
                        }
                        res.json(sendObj);
                    }
                });

                sTTDB.find({ studentID: uid, topicID: tid });

            }
        } else {
            sendObj.txt = "验证失败,请登录后回答问题";
            res.json(sendObj);
        }
    },
    lookTopic: (req, res) => {//讲师开始审题
        var sendObj = {
            aut: false
        };

        if (req.session.userObj && req.session.userObj[0].type == 0) {//讲师身份,可以更改审题状态
            state.topicState = null;
            sendObj.aut = true;
        } else {
            sendObj.txt = "身份验证失败!";
        }
        res.json(sendObj);

    },
    getUserInfo: (req, res) => {//学生统计答题数
        var sendObj = {
            aut: false
        };
        event.emit("GET_RES", res);

        if (req.session.userObj && req.session.userObj[0].type == 1) {

            event.emit("GET_RES", res);
            var type = req.query.type;
            var userObj = req.session.userObj[0];
            var uid = ObjectID(userObj._id);

            var rcCB = null;//答题数回调函数
            var nrcCB = null;//未答题数回调函数
            var cCB = null;//回答错误回调函数
            var rCB = null;//回答正确的回调函数
            var dbErrCallBack = data => {
                if (data.oop == "count" && data.parameter.state === true) {//答题数
                    rcCB({ type: "replyCount", err: data }, null);
                } else if (data.oop == "count" && data.parameter.state === false) {//未答题数
                    rcCB({ type: "notReplyCount", err: data }, null);
                } else if (data.oop == "count" && data.parameter.result == -1) {//回答错误答题数
                    rcCB({ type: "errorCount", err: data }, null);
                } else if (data.oop == "count" && data.parameter.result == 1) {//正确答题数
                    rcCB({ type: "rightCount", err: data }, null);
                }
            };


            if (!type || type == "all") {//获取全部信息,包括答题数,正确率,未答题数
                var infoObj = {};

                async.parallel([function (callback) {
                    rcCB = callback;
                }, function (callback) {
                    nrcCB = callback;
                }, function (callback) {
                    cCB = callback;
                }, function (callback) {
                    rCB = callback;
                }], function (err, results) {

                    if (!err) {
                        var dataObj = {};

                        results.map(function (item) {
                            dataObj[item.type] = item.content;
                        })

                        sendObj.aut = true;
                        sendObj.type = "all";
                        sendObj.data = dataObj;
                        res.json(sendObj);
                    } else {
                        sendObj.txt = "数据库出错,请联系网站管理员!";
                        console.log(err);
                    }
                });

                event.removeAllListeners("DB_OOP_SUCCESS");
                event.on("DB_OOP_SUCCESS", data => {

                    if (data.oop == "count" && data.parameter.state === true) {//答题数
                        rcCB(null, { type: "replyCount", content: data.info });
                    } else if (data.oop == "count" && data.parameter.state === false) {//未答题数
                        nrcCB(null, { type: "notReplyCount", content: data.info });
                    } else if (data.oop == "count" && data.parameter.result == -1) {//回答错误答题数
                        cCB(null, { type: "errorCount", content: data.info });
                    } else if (data.oop == "count" && data.parameter.result == 1) {//正确答题数
                        rCB(null, { type: "rightCount", content: data.info });
                    }
                });

                sTTDB.count({ studentID: uid, state: true });
                sTTDB.count({ studentID: uid, state: false });
                sTTDB.count({ studentID: uid, result: -1 });
                sTTDB.count({ studentID: uid, result: 1 });
                // sendObj.content = data.info;
                // sendObj.aut = true;
                // res.json(sendObj);
            } else if (type == "replyCount") {//获取答题数
                event.removeAllListeners("DB_OOP_SUCCESS");
                event.on("DB_OOP_SUCCESS", data => {
                    sendObj.aut = true;
                    sendObj.content = data.info;
                    sendObj.type = type;
                    res.json(sendObj);
                });

                sTTDB.count({ studentID: uid, state: true });
            } else if (type == "notReplyCount") {//获取未答题的数量
                event.removeAllListeners("DB_OOP_SUCCESS");
                event.on("DB_OOP_SUCCESS", data => {
                    sendObj.aut = true;
                    sendObj.content = data.info;
                    sendObj.type = type;
                    res.json(sendObj);
                });

                sTTDB.count({ studentID: uid, state: false });
            } else if (type == "Accuracy") {//获取答题正确率

                async.parallel([
                    function (callback){
                        cCB = callback;
                    },
                    function (callback){
                        rCB = callback;                        
                    }
                    
                ],function(err , results){
                    if (!err) {
                        var dataObj = {};

                        results.map(function (item) {
                            dataObj[item.type] = item.content;
                        })

                        sendObj.aut = true;
                        sendObj.type = "all";
                        sendObj.data = dataObj;
                        res.json(sendObj);
                    } else {
                        sendObj.txt = "数据库出错,请联系网站管理员!";
                        console.log(err);
                    }
                });

                event.removeAllListeners("DB_OOP_SUCCESS");
                event.on("DB_OOP_SUCCESS", data => {

                    if(data.oop == "count" && data.parameter.result == -1){
                        cCB(null , {type : "errorCount" , content : data.info});
                    }else if(data.oop == "count" && data.parameter.result == 1){
                        rCB(null , {type : "rightCount" , content : data.info});                        
                    }
                    sendObj.aut = true;
                    sendObj.content = data.info;
                    sendObj.type = type;
                    res.json(sendObj);


                });

                sTTDB.count({ studentID: uid, result: -1 });
                sTTDB.count({ studentID: uid, result: 1 });
            }

        } else {
            sendObj.txt = "请登录学员账号";
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


