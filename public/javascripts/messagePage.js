$(function () {
    var ws = new WebSocket("ws://localhost:8000");
    var sktObj = {
        type: "CONNECT",
        code: 200
    };
    var userBox = $("#friendBox");
    var messageFun = $("#messageFunction");
    var messageBox = $("#messageBox");
    var messageBuffer = {};
    var sendObj = null;
    var userItem = $('<li><a href="javascript:;"></a></li>');
    var userId = $("#userBox").attr("data-user");
    var username = $("#userBox").find("h2").text();
    ws.onopen = function (event) {
        var sktStr = JSON.stringify(sktObj);
        ws.send(sktStr);
    }

    ws.onmessage = function (event) {
        var dataObj = JSON.parse(event.data);

        switch (dataObj.type) {
            case "USER_NUMBER":
                $("#userNumber").text(dataObj.content);
                break;
            case "USER_LIST":
                updateUserList(dataObj.content);//更新用户列表
                break;
            case "MESSAGE":
                receiveInfo(dataObj);
                break;
        }

    }

    //好友列表点击事件委托
    userBox.on("click", "li", function (e) {
        var liItem = $(this);
        sendObj = {
            id: liItem.attr("data-id"),
            username: liItem.find("a").text()
        }
        messageFun.find("h2").text(sendObj.username);

        updateMessageBox(messageBuffer[sendObj.id]);//更新信息窗口
        liItem.removeClass("active");
    })

    //更新用户列表
    function updateUserList(userList) {
        userBox.empty();
        for (var i in userList) {

            if (userList[i]._id != userId) {
                var item = userItem.clone(false);

                item.attr("data-id", userList[i]._id);
                item.find("a").text(userList[i].username);

                userBox.append(item);

            }
        }
    }

    $("#sendBtn").click(function () {
        if (sendObj) {//拥有指定对象时才发送数据
            var sendData = {
                type: "MESSAGE",
                sendObj: sendObj,
                content: $("#userInput").val()
            }
            ws.send(JSON.stringify(sendData));
            var data = {
                isMe : true,
                content : sendData.content
            }
            if(!messageBuffer[sendObj.id]){
                messageBuffer[sendObj.id] = [];
            }
            messageBuffer[sendObj.id].push(data);
            updateMessageBox(messageBuffer[sendObj.id]);
            $("#userInput").val("");
        }
    });

    $("#clearBtn").click(function(){
        messageBox.empty();
        delete messageBuffer[sendObj.id];
    });

    /**
     * 收到消息时触发
     * @param {object} data 
     */
    function receiveInfo(data) {
        // userBox.find("li[data-id="+sendID+"]").addClass
        if (sendObj && sendObj.id == data.sendID) {//如果聊天框是当前用户,则将信息直接显示在信息框中
            receiveMessage(data);
        } else {//否者仅闪动用户列表中的用户名,并将消息存入buffer中
            userBox.find("li[data-id=" + data.sendID + "]").addClass("active");
            if (!messageBuffer[data.sendID]) {
                messageBuffer[data.sendID] = [];
            }
            data.isMe = false;
        }
        if(!messageBuffer[data.sendID]){
            messageBuffer[data.sendID] = [];
        }
        messageBuffer[data.sendID].push(data);
    }

    /**
     * 将消息显示在消息盒子当中
     * @param {object} data 必须属性sendID:消息发送者ID; content:消息内容
     */
    function receiveMessage(data) {
        var sendID = null;
        var sendName = null;
        var content = data.content;
        var item = null;
            item = $("<p><span class='sender'></span><span class='message'></span></p>");

        if(!data.isMe){//如果不是自己发的消息
            sendID = data.sendID;
            sendName = userBox.find("li[data-id=" + sendID + "]").find("a").text();
            item.find(".sender").text(sendName + ":");
        }else{//是自己发的消息
            item.addClass("isMe");
            item.find(".sender").text(":" + username);
        }
        item.find(".message").text(content);
        messageBox.append(item);
        messageBox.scrollTop( messageBox[0].scrollHeight );
    }

    //更新消息列表
    function updateMessageBox(dataList) {
        messageBox.empty();
        for (var i in dataList) {
            receiveMessage(dataList[i]);
        }
    }

});