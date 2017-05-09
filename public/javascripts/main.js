/**
 * 验证用户名是否合法(密码为4-20位字母或数字下划线)
 * @param {string} name 用户名
 */
var testName = function(name) {
    var zz = /\w{4,20}/;
    return zz.test(name);
}

/**
 * 验证密码是否合法(不含空格且仅为6-20位数字字母或下划线)
 * @param {string} pwd 密码
 */
var testPwd = function(pwd){
    var zz = /^\w{6,20}$/;
    return zz.test(pwd);
}

/**
 * 验证邮箱是否合法
 * @param {string} eml 邮箱
 */
var testEmail = function(eml){
    var zz = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/;
    return zz.test(eml);
}

/**
 * 验证班级是否合法
 * @param {string} className 班级编号
 */
var testClass = function(className){
    var zz = /\w{4,20}/;
    return zz.test(className);
}

/**
 * 验证讲师验证码是否合法(验证码为1-20位字母或数字下划线)
 * @param {string} name 验证码
 */
var testVCode = function(name) {
    var zz = /\w{1,20}/;
    return zz.test(name);
}

/**
 * 传入指定的from模块jq Dom对象,最终检测所有的值是否合法,只有当所有的值合法时才返回true
 * @param {object} forDom jquery的dom对象,为需要验证的from对象
 */
var testAll = function(forDom){
    var isAut = true;
    var pwdVal = "";
    var type = $(".form-js-module").closest("form")[0].type.value;

    forDom.find(".form-js-module").each(function(){
        var did = $(this).attr("id");
        var inVal = $(this).find("input").val();
        switch(did){
            case "username"://验证用户名
                if(!testName(inVal)){
                    isAut = false;
                    oopM($(this), "用户名格式不正确");
                }
                break;
            case "password"://验证密码
                if(!testPwd(inVal)){
                    isAut = false;
                    oopM($(this), "密码格式不正确");                    
                }else{
                    pwdVal = inVal;
                }
                break;
            case "password1"://验证重复密码
                if(!testPwd(inVal) || pwdVal != inVal){
                    isAut = false;
                    oopM($(this), "密码不一致");                                        
                }
                break;
            case "email"://验证邮箱
                if(!testEmail(inVal)){
                    isAut = false;
                    oopM($(this), "邮箱格式不正确");                                        
                }
                break;
            case "class"://验证班级
                if(type == 0 && !testClass(inVal)){
                    isAut = false;
                    oopM($(this), "班级名格式不正确");                                        
                }
                break;
            case "vCode"://讲师注册邀请码
                
                if(type == 0 && !testVCode(inVal)){//讲师注册
                    isAut = false;
                    oopM($(this), "注册邀请码格式不正确");                    
                }
                break;
        }

    });

    return isAut;
}

/**
 * 指定的信息模块添加提示信息
 * @param {object} dom 需要添加提示信息的jquery dom对象
 * @param {string} txt 提示的文本信息
 * @param {boolean} isTrue 提示信息类型,默认值为false代表非法,true为合法
 */
function oopM(dom, txt, isTrue) {
    dom.find(".info").text(txt);
    var did = dom.attr("id");
    if (!isTrue) {
        dom.addClass("err");
        dom.removeClass("suc");
    } else {
        dom.addClass("suc");
        dom.removeClass("err");    
    }
}