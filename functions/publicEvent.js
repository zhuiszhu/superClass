var EventEmitter = require("events").EventEmitter;
var events = new EventEmitter();
var dbCon = require("../functions/projectConfig").db;
var res,sendObj = {aut : false};

module.exports = events;
events.on("GET_RES" , webRes => {
    res = webRes;
});
events.on("DB_CONN_ERROR", data => {
    console.log(`数据库连接失败,连接地址:${dbCon.connect},端口号:${dbCon.port},数据库名:${dbCon.dbname},具体信息如下:`);
    console.log(data);
    sendObj.txt = "服务器错误,请联系管理员";
    res.json(sendObj);
    res = null;//操作完成清空res对象,方便维护
});

events.on("DB_OOP_ERROR", data => {
    console.log(`数据库操作失败,连接地址:${dbCon.connect},端口号:${dbCon.port},数据库名:${dbCon.dbname},具体信息如下:`);
    console.log(data);
    sendObj.txt = "服务器错误,请联系管理员";
    res.json(sendObj);
    res = null;//操作完成清空res对象,方便维护
});
