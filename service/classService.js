var DBCon = require("../db/DBconnect.js");
var ObjectId = require("objectid");
var db = new DBCon("users");
var sTTDB = new DBCon("studentToTopic");
var event = require("../functions/publicEvent");
var SocketObj = require("../service/socketService");
var state = require("./projectState.js");

var classService = {
    teacherPage: (req, res) => {//讲师页面
        if (req.session.userObj && req.session.userObj[0].type == 0) {
            event.emit("GET_RES", res);
            var userObj = req.session.userObj[0];
            SocketObj.sendSessionObj(userObj);

            event.removeAllListeners("DB_OOP_SUCCESS");
            event.on("DB_OOP_SUCCESS", data => {

                if (data.collection == "users" && data.oop == "find") {
                    var usr = data.info;

                    res.render("index", {
                        page: "teacherPage",
                        title: `超级课堂--${userObj.username}`,
                        stuList: usr,
                        userObj: userObj
                    });

                    if (state.topicState != null) {
                        sTTDB.find({ state: true, topicID: state.topicState._id });
                    }
                } else if (data.collection == "studentToTopic" && data.oop == "find") {
                    var list = data.info;
                    event.removeAllListeners("TEACHER_INLINE");
                    event.once("TEACHER_INLINE", function () {
                        list.map(function (item) {
                            SocketObj.sendReply(item);
                        })
                    });
                }
            });

            db.find({ type: "1", class: userObj.class }, { password: 0 });

        } else if (req.session.userObj && req.session.userObj[0].type == 1) {
            res.redirect("/student");
        } else {
            res.redirect("/users/login");
        }
    },
    studentPage: (req, res) => {//学生页面
        if (req.session.userObj && req.session.userObj[0].type == 1) {
            event.emit("GET_RES", res);
            var userObj = req.session.userObj[0];
            //向socket服务器传送session用户信息
            SocketObj.sendSessionObj(userObj);

            //获取读题状态,非空为回答题目期间
            if (state.topicState != null) {
                event.removeAllListeners("DB_OOP_SUCCESS");
                event.once("DB_OOP_SUCCESS", data => {
                    var stt = data.info[0];

                    if (!stt.state) {//题目未回答过,给学生客户端提示
                        SocketObj.sendTopicToUser(userObj._id, state.topicState);
                    }
                });

                // 包装id 以供查询
                var sid = ObjectId(userObj._id);
                var tid = ObjectId(state.topicState._id);

                event.removeAllListeners(userObj._id);
                event.on(userObj._id, function () {//注册学员的上线事件,当学员websoket客户端上线之后,再触进行查询题目
                    //查询学员题目关系表,查看该题学员是否回答过
                    sTTDB.find({ studentID: sid, topicID: tid });

                })
            }

            res.render("index", {
                page: "studentPage",
                title: `超级课堂--${userObj.username}`,
                userObj: userObj
            });


        } else if (req.session.userObj && req.session.userObj[0].type == 0) {
            res.redirect("/teacher");
        } else {
            res.redirect("/users/login");
        }
    }
};

module.exports = classService;