var express = require('express');
var router = express.Router();
var userService = require("../service/userService");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//登录页面
router.get('/login' , (req , res , next) => {
  userService.loginPage(req , res);
})

//注册页面
router.get('/register' , (req , res , next) => {
  userService.registerPage(req , res);
})

//讲师注册页面
router.get('/teacherRegister' , (req , res , next) => {
  userService.adminRegisterPage(req , res);
})


module.exports = router;
