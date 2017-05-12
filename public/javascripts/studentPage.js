$(function () {
    var ws = new WebSocket("ws://192.168.59.223:8000");
    var topicDom = $(".topic-box");
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
                console.log(dataObj);
                topicDom.show();
                topicDom.find(".topic-title").find("span").text(dataObj.content.title);
                topicDom.find(".topic-content").find("p").text(dataObj.content.content);
                $("#topic").attr("data-id",dataObj.content._id);
                break;
        }

    }


});