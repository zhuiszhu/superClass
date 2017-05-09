var db = require("../db/teacherDB");
var event = require("../functions/publicEvent");
var getSocketUser = require("../service/socketService");

var classService = {
    teacherPage: (req, res) => {//讲师页面
        if (req.session.userObj && req.session.userObj[0].type == 0) {
            //向socket服务器传送session用户信息
            getSocketUser(req.session.userObj[0]);
            res.send("教师页面");
            /*
            res.render("index", {
                page: "messagePage",
                title: "聊天室",
                username : req.session.userObj[0].username,
                userID : req.session.userObj[0]._id,
                friends : [
                    {
                        username : "abc123",
                        id : "123"
                    },
                    {
                        username : "aaa123",
                        id : "12"
                    },
                    {
                        username : "aaa",
                        id : "1"
                    },
                ]
            });*/
        }else if(req.session.userObj && req.session.userObj[0].type == 1){
            res.redirect("/student");            
        } else {
            res.redirect("/users/login");
        }
    },
    studentPage: (req , res) => {//学生页面
        if(req.session.userObj && req.session.userObj[0].type == 1){
            res.send("学生页面");
        }else if(req.session.userObj && req.session.userObj[0].type == 0){
            res.redirect("/teacher");            
        }else{
            res.redirect("/users/login");
        }
    }
};

module.exports = classService;