module.exports = {
    sendErr: sendErr
}

/**
 * 
 * @param {object} err 数据库操作或链接失败返回的对象信息
 * @param {object} res 需要返回给页面的res对象
 * @param {object} sendObj 需要发送给页面的数据对象
 */
var sendErr = (err, res, sendObj) => {
    console.log(`数据库连接失败,连接地址:${dbCon.connect},端口号:${dbCon.port},数据库名:${dbCon.dbname},具体信息如下:`);
    console.log(err);
    sendObj.txt = "服务器错误,请联系管理员";
    res.json(sendObj);
    res = null;//操作完成清空res对象,方便维护
}