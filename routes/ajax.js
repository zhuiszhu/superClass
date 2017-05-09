var express = require('express');
var router = express.Router();
var userService = require('../service/userService');

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


module.exports = router;
