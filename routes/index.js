var express = require('express');
var router = express.Router();
var userServer = require("../service/userService.js");
var classServer = require("../service/classService.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  // res.send("this is home page");
  userServer.indexPage(req , res);
});

// 教师页面
router.get('/teacher', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  // res.send("this is home page");
  classServer.teacherPage(req , res);
});

// 学生页面
router.get('/student', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  // res.send("this is home page");
  classServer.studentPage(req , res);
});

module.exports = router;
