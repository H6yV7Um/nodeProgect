var express = require('express');
var router = express.Router();



/* 获取我的群信息 */
router.get('/', function (req, res, next) {
	res.render('index', { title: '图片花园' });
});




module.exports = router;
