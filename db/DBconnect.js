var mClient = require("mongodb").MongoClient;
var dbConfig = require("../functions/projectConfig").db;
const DB_CONN_STR = `mongodb://${dbConfig.connect}:${dbConfig.port}/${dbConfig.dbname}`;
var event = require("../functions/publicEvent");

/**
 * 通过该构造函数可获取数据库操作对象
 * @param {string} collectionName 集合名 
 */
function DBPool(collectionName) {//操作表构造函数
    /**
     * 插入数据,参数为需要插入的对象
     */
    this.insert = data => {
        var thisObj = this;
        mClient.connect(DB_CONN_STR, (err, db) => {
            var eObj = {
                collection: collectionName,
                oop: "insert"
            }
            if (err) {
                eObj.info = err;
                event.emit("DB_CONN_ERROR", eObj);
            } else {
                var coll = db.collection(eObj.collection);

                coll.insert(data, (err, results) => {
                    if (err) {
                        eObj.info = err;
                        event.emit("DB_OOP_ERROR", eObj);
                    } else {
                        eObj.info = results;
                        event.emit("DB_OOP_SUCCESS", eObj);
                    }
                })

                db.close();
            }
        })
    }

    /**
     * 查询数据,第二个参数为数据筛选(可选)
     * @param {object} data 需要查询的条件
     * @param {object} select 需要查询的字段
     */
    this.find = (data , select) => {
        mClient.connect(DB_CONN_STR, (err, db) => {
            var eObj = {
                collection: collectionName,
                oop: "find"
            }
            if (err) {
                eObj.info = err;
                event.emit("DB_CONN_ERROR", eObj);
            } else {
                var users = db.collection(eObj.collection);
                if(!select){
                    users.find(data).toArray((err, dbData) => {
                        if (err) {
                            eObj.info = err;
                            event.emit("DB_OOP_ERROR", eObj);
                        } else {
                            eObj.info = dbData;
                            event.emit("DB_OOP_SUCCESS", eObj);
                        }
                    })
                }else{
                    users.find(data,select).toArray((err, dbData) => {
                        if (err) {
                            eObj.info = err;
                            event.emit("DB_OOP_ERROR", eObj);
                        } else {
                            eObj.info = dbData;
                            event.emit("DB_OOP_SUCCESS", eObj);
                        }
                    })
                }

                db.close();
            }
        })
    }
}

module.exports = DBPool;
// export {DBPool , dbPool};
