var express = require('express');
var router = express.Router();
var messageService = require('../service/messageService');

/* 聊天界面 */
router.get('/', function(req, res, next) {
  messageService.messagePage(req , res);
});

module.exports = router;
