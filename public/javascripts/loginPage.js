(function(){
    var loginModule = $("#loginModule"),//form对象
        userObj = {},//用户信息
        usernameDom = $("#username"),//username模块Dom
        passwordDom = $("#password"),//password模块Dom
        aut = {
            username: false,
            password: false
        };

    //注册提交事件
    loginModule.on("submit" , function(e){
        e.preventDefault();
        userObj.username = usernameDom.find("input").val();
        userObj.password = passwordDom.find("input").val();

        var isAut = testAll(loginModule);

        if(isAut){
            //提交用户信息
            $.ajax({
                url : "/ajax/users/login",
                data : userObj,
                type : "post",
                success : function(data){
                    if(data.aut){
                        location.href = "/message";
                    }else{
                        alert(data.txt);
                    }
                }
            })
        }


    });

    loginModule.find("input").on("blur" , function(e){
        var mod = $(this).closest(".form-js-module");
        var did = mod.attr("id");
        var inVal = $(this).val();

        switch(did){
            case "username"://用户名
                if(!testName(inVal)){
                    oopM(mod, "请输入4-20位字母和数字组成的用户名");
                }else{
                    oopM(mod, "" , true);                    
                }
                break;
            case "password"://密码
                if(!testPwd(inVal)){
                    oopM(mod, "请输入4-20位字母和数字组成的密码");                    
                }else{
                    oopM(mod, "" , true);                    
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