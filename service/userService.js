var DB = require("../db/DBconnect.js");
var db = new DB("users");
var event = require("../functions/publicEvent");
var jm = require("../functions/ecryption").pwd;

var userService = {
    indexPage: (req , res) => {
        if(req.session.userObj && req.session.userObj[0].type == 0){
            res.redirect("/teacher");
        }else if(req.session.userObj && req.session.userObj[0].type == 1){
            res.redirect("/student");            
        }else{
            res.redirect("/users/login");
        }
    },
    loginPage: (req, res) => {//登录页面
        res.render("index", {
            page: "loginPage",
            title: "message-登录页面"
        });
    },
    login: (req, res) => {//登录请求
        event.emit("GET_RES", res);
        var userObj = req.body;
        var sendObj = {
            aut: false
        }
        userObj.username = userObj.username.trim();

        if (!testName(userObj.username)) {//用户名不合法
            sendObj.txt = "用户名不合法";
        } else if (!testPwd(userObj.password)) {
            sendObj.txt = "密码不合法";
        } else {//用户名密码合法,执行进一步操作
            sendObj.aut = true;
        }

        if (!sendObj.aut) {//用户名密码不合法不执行查询操作,将提示对象直接返回给前端
            res.json(sendObj);
        } else {//用户名密码均合法则执行进一步操作
            sendObj.aut = false;
            userObj.password = jm(userObj.password);//加密密码

            event.removeAllListeners("DB_OOP_SUCCESS");
            event.once("DB_OOP_SUCCESS", data => {
                var usr = data.info;
                if (usr.length == 0) {//用户名密码不正确
                    sendObj.txt = "用户名密码不正确,请重新输入";
                } else {
                    sendObj.txt = "恭喜您登录成功!"
                    sendObj.aut = true;
                    sendObj.userType = usr[0].type;
                    req.session.userObj = usr;
                }
                res.json(sendObj);
            });

            db.find(userObj);
        }
    },
    registerPage: (req, res) => {//注册页面
        res.render("index", {
            page: "registerPage",
            title: "message-注册页面"
        });
    },
    register: (req, res) => {//注册请求
        event.emit("GET_RES", res);
        var userObj = req.body;

        var sendObj = {
            aut: false
        }
        userObj.username = userObj.username.trim();
        userObj.class = userObj.class.trim();       

        //验证数据是否合法
        if (!testName(userObj.username)) {
            sendObj.txt = "用户名不合法";
        } else if (!testPwd(userObj.password)) {
            sendObj.txt = "密码不合法";
        } else if (!testClass(userObj.class)) {
            sendObj.txt = "班级名称不合法";
        } else if (userObj.type == 0 && userObj.vCode != "thisiszhu") {
            sendObj.txt = "邀请码错误";
        } else if (userObj.type == 1 && !testActualName(userObj.actualName)) {
            sendObj.txt = "请输入真实姓名!";
        } else {
            sendObj.aut = true;
        }

        if (!sendObj.aut) {//信息不合法时像前端返回信息,并不执行插入数据操作
            res.json(sendObj);
        } else {//信息合法时,执行进一步操作
            sendObj.aut = false;

            //数据库操作成功
            event.removeAllListeners("DB_OOP_SUCCESS");
            event.on("DB_OOP_SUCCESS", data => {
                var usr = null;
                if (data.oop == "find") {//查询成功
                    usr = data.info;
                    if (usr.length == 0) {//用户名不存在,可用

                        /**
                         * 注册各种操作
                         */

                        userObj.password = jm(userObj.password);
                        userObj.date = new Date();
                        userObj.friends = [];

                        db.insert(userObj);//开始注册

                    } else {//用户名已存在,返回结果
                        sendObj.txt = "用户名已存在";
                        res.json(sendObj);
                    }
                } else if (data.oop == "insert") {//注册成功
                    sendObj.aut = true;
                    sendObj.txt = "注册成功!";
                    res.json(sendObj);
                }
            });

            db.find({ username: userObj.username });

        }
    },
    findUser: (req, res) => {//用户名验证
        event.emit("GET_RES", res);
        var username = req.body.username;
        var sendObj = {
            aut: false
        };
        if (!testName(username)) {//用户名不合法
            sendObj.txt = "用户名不合法";
            res.json(sendObj);
        } else {//用户名合法

            event.removeAllListeners("DB_OOP_SUCCESS");
            event.on("DB_OOP_SUCCESS", data => {//查询成功
                var usr = data.info;
                sendObj.aut = true;

                if (usr.length == 0) {
                    sendObj.txt = "用户名不存在";
                    sendObj.code = 0;
                } else {
                    sendObj.aut = true;
                    sendObj.txt = "用户名已存在";
                    sendObj.code = 1;
                }

                res.json(sendObj);
            });

            db.find({ username: username });
        }

    },
    findClass: (req , res) => {//查询班级
        event.emit("GET_RES", res);

        event.removeAllListeners("DB_OOP_SUCCESS");
            event.on("DB_OOP_SUCCESS", data => {//查询成功
                res.json(data.info);
            });

            db.find({ type: "0" },{class:1 , _id : 0});
    }
};

/**
 * 验证用户名是否合法(密码为4-20位字母或数字下划线)
 */
var testName = name => {
    var zz = /\w{4,20}/;
    return zz.test(name);
}

/**
 * 验证密码是否合法(不含空格且仅为6-20位数字字母或下划线)
 */
var testPwd = pwd => {
    var zz = /^\w{6,20}$/;
    return zz.test(pwd);
}

/**
 * 验证邮箱是否合法
 */
var testEmail = eml => {
    var zz = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/;
    return zz.test(eml);
}

/**
 * 验证班级名是否合法
 * @param {string} className 班级名称
 */
var testClass = className => {
    var zz = /\w{4,20}/;
    return zz.test(className);
}

/**
 * 验证真实姓名是否合法
 * @param {string} aName 真实姓名
 */
var testActualName = aName => {
    var zz = /^([\u4e00-\u9fa5]){2,4}$/;
    return zz.test(aName);
}

module.exports = userService;