var db = require("../db/teacherDB");
var event = require("../functions/publicEvent");
var getSocketUser = require("../service/socketService");

var messageService = {
    messagePage: (req, res) => {//信息页面
        if (req.session.userObj) {
            //向socket服务器传送session用户信息
            getSocketUser(req.session.userObj[0]);
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
            });
        } else {
            res.redirect("/users/login");
        }
    }
};

module.exports = messageService;