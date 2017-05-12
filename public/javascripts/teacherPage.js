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
                var num = dataObj.content.length;
                $(".student-list").find("li.inline").removeClass("inline");
                dataObj.content.map(function(item){
                    $(".student-list").find("li[data-id="+item._id+"]").addClass("inline");
                })
                $("#inlineNum").text(num);
                break;
            case "MESSAGE":
                // receiveInfo(dataObj);
                break;
            case "REPLY":
                var stuDom = $(".student-list").find("li[data-id="+dataObj.content.studentID+"]");
                stuDom.find(".reply-box").text(dataObj.content.replyContent);
                stuDom.addClass("answer");
                
                break;
        }

    }

    $(".topic-panel").find(".close-btn").click(function(){
        $(this).closest(".topic-box").hide();
    });

    $(".pushTopic").click(function(){
        $(".topic-box").show();
    })

    $("#topic").submit(function(e){
        e.preventDefault();

        var topicObj = {
            title : this.topicTitle.value,
            content : this.topicContent.value,
            fraction : this.fraction.value
        }

        topicObj.title = topicObj.title.trim();
        topicObj.content = topicObj.content.trim();

        if(!topicObj.title){
            $(this.topicTitle).addClass("err");
        }else if(!topicObj.content){
            $(this.topicContent).addClass("err");            
        }else{//标题和内容均有数据,允许提交
            $.ajax({
                url : "/ajax/insertTopic",
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
    })

    $("#topic").on("blur" , ".err" , function(){
        // var value = $(this).value;
        var value = $.trim(this.value);
        if(!!value){
            $(this).removeClass("err");
        }
    })
    
    $("#topic").find("input.fraction").on("blur" , function(){
        var value = this.value*1;
        
        if(isNaN(value) || value == 0){
            $(this).val(2);
        }
    })

    $(".show-js-btn").click(function(){
        $(".answer").removeClass("answer");
        $(".inline").addClass("reply");
    });
});