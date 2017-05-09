var crypto = require("crypto");

var encry = {
    pwd : pwd => {
        var md5 = crypto.createHash("md5");
        md5.update(pwd);
        var jmTxt = md5.digest("hex");
        return jmTxt;
    }
}

module.exports = encry;