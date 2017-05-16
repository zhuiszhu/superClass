(function () {
    var loginModule = $("#registerModule"),//form对象
        userObj = {},//用户信息
        usernameDom = $("#username"),//username模块Dom
        passwordDom = $("#password"),//password模块Dom
        password1Dom = $("#password1"),//password1模块Dom
        classDom = $("#class"),//class模块Dom
        vCodeDom = $("#vCode"),//邀请码模块Dom
        aut = {
            username: false,
            password: false,
            password1: false,
            class: false,
            type: 0,
            vCode: true
        }
    //初始化班级列表
    $.ajax({
        url : "/ajax/users/findClass",
        type : "get",
        success : function(data){
            data.map(function(item){
                var oDom = $("<option value='"+item.class+"'>"+item.class+"</option>");
                $("#stuClass").find("select").append(oDom);
            })
        }
    })

    //注册提交事件
    loginModule.on("submit", function (e) {
        // testAll(loginModule);
        e.preventDefault();
        var type = this.type.value;

        var isAut = testAll(loginModule);

        if (isAut) {
            userObj.username = usernameDom.find("input").val();
            userObj.password = passwordDom.find("input").val();
            userObj.type = type;
            if(type == 0){//若是讲师注册,则提交邀请码,并从输入框中获取class
                userObj.vCode = vCodeDom.find("input").val();
                userObj.class = classDom.find("input").val();
            }else{//若是学生注册,则从选择框中获取class
                userObj.class = loginModule[0].stuClass.value;
                console.log(userObj.class);
            }

            //提交用户信息
            $.ajax({
                url: "/ajax/users/register",
                data: userObj,
                type: "post",
                success: function (data) {
                    if(data.aut){
                        console.log("注册成功!");
                        window.location.href = "/users/login";
                    }else{
                        console.log(data);
                    }

                }
            });
        }

    });

    $(".form-js-module#type").find("input").on("change" , function(){//选择type类型
        var type = loginModule[0].type.value;
        if(type == 0){
            $("#vCode").show();
            $("#class").show();
            $("#stuClass").hide();
        }else{
            $("#vCode").hide();
            $("#class").hide();            
            $("#stuClass").show();            
        }
    });

    $(".form-js-module").find("input").on("blur", function (e) {
        var mod = $(this).closest(".form-js-module");
        var did = mod.attr("id");
        var inVal = $(this).val();
        var type = $(this).closest("form")[0].type.value;
        


        switch (did) {
            case "username"://验证用户名
                if (!testName(inVal)) {//用户名不合法
                    oopM(mod, "请输入4-20位字母和数字组成的用户名");
                } else {
                    //提交用户名
                    $.ajax({
                        url: "/ajax/users/findUser",
                        data: { username: inVal },
                        type: "post",
                        success: function (data) {
                            if (data.code == 0 && data.aut) {
                                oopM(mod, "用户名可用", true);
                            } else if (data.aut) {
                                oopM(mod, "用户名已存在");
                            } else {
                                oopM(mod, "服务器发生错误,请联系管理员");
                            }
                        }
                    })
                }
                break;
            case "password"://验证密码
                if (!testPwd(inVal)) {
                    oopM(mod, "请输入6-20位字母和数字组成的密码");
                } else {
                    oopM(mod, "密码可用", true);
                }

                if(password1Dom.hasClass("err") || password1Dom.hasClass("suc")){//当重复密码有值时,需要进行验证
                    if(password1Dom.find("input").val() != inVal){
                        oopM(password1Dom , "密码不一致");
                    }else{
                        oopM(password1Dom , "确认成功" , true);
                    }
                }
                break;
            case "password1":
                if (inVal != $("#password").find("input").val()) {
                    oopM(mod, "密码不一致");
                } else if (!testPwd(inVal)) {
                    oopM(mod, "密码格式错误");
                } else {
                    oopM(mod, "确认成功", true);
                }
                break;
            case "email":
                if (!testEmail(inVal)) {
                    oopM(mod, "请输入正确的邮箱地址");
                } else {
                    oopM(mod, "邮箱可用", true);
                }
                break;
            case "class":
                if (!testClass(inVal)) {
                    oopM(mod, "请输入正确的班级名称");
                } else {
                    oopM(mod, "班级可用", true);
                }
                break;
            case "vCode":
                if (type == 0 && !testVCode(inVal)){
                    oopM(mod, "请输入1-20位字母和数字组成的邀请码");
                }else if(type == 0){
                    oopM(mod, "邀请码格式正确" , true);
                }
                break;
            case "actualName":
                if(type == 1 && !testActualName(inVal)){//学生注册
                    isAut = false;
                    oopM(mod, "请输入真实姓名!不许调皮!");                    
                }else{
                    oopM(mod, "姓名格式正确" , true);
                }
                break;
        }


    });

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
            aut[did] = false;
        } else {
            dom.addClass("suc");
            dom.removeClass("err");
            aut[did] = true;            
        }
    }
})();
