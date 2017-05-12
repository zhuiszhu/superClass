$(function () {
    var ws = new WebSocket("ws://192.168.59.223:8000");
    var topicDom = $(".topic-box");
    var formDom = $("#topic");
    var sktObj = {
        type: "CONNECT",
        code: 200
    };

    //连接成功,向socket服务器响应
    ws.onopen = function (event) {
        var sktStr = JSON.stringify(sktObj);
        ws.send(sktStr);
    }

    //接收到socket服务器响应
    ws.onmessage = function (event) {
        var dataObj = JSON.parse(event.data);

        //对消息类型进行分类
        switch (dataObj.type) {
            case "USER_NUMBER":
                $("#userNumber").text(dataObj.content);
                break;
            case "USER_LIST":
                // updateUserList(dataObj.content);//更新用户列表
                console.log(dataObj);
                break;
            case "MESSAGE":
                // receiveInfo(dataObj);
                break;
            case "TOPIC":
                topicDom.find(".topic-title").find("span").text(dataObj.content.title);
                topicDom.find(".topic-content").find("p").text(dataObj.content.content);
                $("#topic").attr("data-id",dataObj.content._id);
                topicDom.show();
                break;
        }

    }

    formDom.on("submit" , function(e){
        e.preventDefault();
        var topicObj = {
            topicId : $(this).attr("data-id"),
            content : this.topicContent.value
        }

        topicObj.content = topicObj.content.trim();

        if(!topicObj.content){
            $(this.topicContent).addClass("err");            
        }else{//内容有数据,允许提交
            
            $.ajax({
                url : "/ajax/replyTopic",
                type : "post",
                data : topicObj,
                success : function(data){
                    if(data.aut){
                        // alert(data.txt);
                        $(".topic-box").hide();
                        $("#topic").find("input.title").val("");
                        $("#topic").find("textarea").val("");
                    }else{
                        alert(data.txt);
                    }
                }
            })
        }
    });

    formDom.on("blur" , ".err" , function(){
        // var value = $(this).value;
        var value = $.trim(this.value);
        if(!!value){
            $(this).removeClass("err");
        }
    });

    $(".topic-panel").find(".close-btn").click(function(){
        $(this).closest(".topic-box").hide();
    });
});