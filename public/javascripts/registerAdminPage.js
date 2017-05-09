(function () {
    var loginModule = $("#registerModule"),//form对象
        userObj = {},//用户信息
        usernameDom = $("#username"),//username模块Dom
        passwordDom = $("#password"),//password模块Dom
        password1Dom = $("#password1"),//password1模块Dom
        classDom = $("#class"),//class模块Dom
        aut = {
            username: false,
            password: false,
            password1: false,
            class: false
        }

    //注册提交事件
    loginModule.on("submit", function (e) {
        e.preventDefault();

        var isAut = testAll(loginModule);

        if (isAut) {
            userObj.username = usernameDom.find("input").val();
            userObj.password = passwordDom.find("input").val();
            userObj.class = classDom.find("input").val();

            //提交用户信息
            $.ajax({
                url: "/ajax/admin",
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

    //输入框失焦验证
    $(".form-js-module").find("input").on("blur", function (e) {
        var mod = $(this).closest(".form-js-module");
        var did = mod.attr("id");
        var inVal = $(this).val();

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
            case "class":
                if (!testClass(inVal)) {
                    oopM(mod, "请输入正确的班级名称");
                } else {
                    oopM(mod, "班级名可用", true);
                }
                break;
        }


    });

    /**
     * 指定的信息模块添加提示信息
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