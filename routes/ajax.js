var express = require('express');
var router = express.Router();
var userService = require('../service/userService');
var topicService = require('../service/topicService');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/users/login' , (req , res , next) => {
  userService.login(req , res);
})

router.post('/users/register' , (req , res , next) => {
  userService.register(req , res);
})

router.post('/users/findUser' , (req , res , next) => {
  userService.findUser(req , res);
})

//查询可用班级数
router.get('/users/findClass' , (req , res , next) => {
  userService.findClass(req , res);
})

//添加问题
router.post('/insertTopic' , (req , res , next) => {
  topicService.insertTopic(req , res);
})

//回答问题
router.post('/replyTopic' , (req , res , next) => {
  topicService.replyTopic(req , res);
});

//回答问题
router.get('/lookTopic' , (req , res , next) => {
  topicService.lookTopic(req , res);
});

//获取学员相关信息 没有参数为获取全部信息,包括答题数,正确率,未答题数
//单独获取答题数请传参数type=replyCount
//单独获取正确率请传参数type=correctRate
//单独获取未答题数,请传参数type=notReplyCount
router.get('/getUserInfo' , (req , res , next) => {
  topicService.getUserInfo(req , res);
});

//讲师批改试题
router.get('/markTopic' , (req , res , next) => {
  topicService.getUserInfo(req , res);
});




module.exports = router;
