var mClient = require("mongodb").MongoClient;
var dbConfig = require("../functions/projectConfig").db;
const DB_CONN_STR = `mongodb://${dbConfig.connect}:${dbConfig.port}/${dbConfig.dbname}`;
var event = require("../functions/publicEvent");

var dbPool = {
    /**
     * 插入数据并触发DB_OOP_ERROR DB_CONN_ERROR DB_OOP_SUCCESS等事件
     */
    insert: data => {
        mClient.connect(DB_CONN_STR, (err, db) => {
            var eObj = {
                collection: "teacher",
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
    },
    /**
     * 查询数据,并在事件DB_OOP_SUCCESS中返回结果
     */
    find: data => {
        mClient.connect(DB_CONN_STR, (err, db) => {
            var eObj = {
                collection: "users",
                oop: "find"
            }
            if (err) {
                eObj.info = err;
                event.emit("DB_CONN_ERROR", eObj);
            } else {
                var users = db.collection("users");

                users.find(data).toArray((err, dbData) => {
                    if (err) {
                        eObj.info = err;
                        event.emit("DB_OOP_ERROR", eObj);
                    } else {
                        eObj.info = dbData;
                        event.emit("DB_OOP_SUCCESS", eObj);
                    }
                })

                db.close();
            }
        })
    }

}



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

                users.find(data).toArray((err, dbData) => {
                    if (err) {
                        eObj.info = err;
                        event.emit("DB_OOP_ERROR", eObj);
                    } else {
                        eObj.info = dbData;
                        event.emit("DB_OOP_SUCCESS", eObj);
                    }
                })

                db.close();
            }
        })
    }
}

module.exports = DBPool;
// export {DBPool , dbPool};
