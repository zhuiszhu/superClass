$(function () {
    var ws = new WebSocket("ws://192.168.59.223:8000");
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
                var num = dataObj.content.length;
                $(".student-list").find("li.inline").removeClass("inline");
                dataObj.content.map(function(item){
                    console.log(item._id);
                    $(".student-list").find("li[data-id="+item._id+"]").addClass("inline");
                })
                $("#inlineNum").text(num);
                break;
            case "MESSAGE":
                // receiveInfo(dataObj);
                break;
        }

    }

    $(".topic-panel").find(".close-btn").click(function(){
        $(this).closest(".topic-box").hide();
    });

    $(".pushTopic").click(function(){
        $(".topic-box").show();
    })
});