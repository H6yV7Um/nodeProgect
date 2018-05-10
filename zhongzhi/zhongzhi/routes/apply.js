var express = require('express');
var router = express.Router();
var config = require('../common/config');
var functions = require('../common/functions');
var mysql = require('mysql');
var md5 = require('md5');
var dbConfig = require('../common/Dbconfig');
// 使用DBConfig.js的配置信息创建一个MySQL连接池
var connection = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  port: dbConfig.port,
  database: dbConfig.database
});
// 从连接池获取连接
connection.connect();


/* 查询申请列表. */
router.get('/applyList/:page', function (req, res, next) {
  var page = parseInt(req.params.page);
  var n = page==1?0:10*page-11;
  connection.query(
      'SELECT * FROM apply',
      function (err, result) {
    if (err) {
      console.log(err)
      res.json({
        retCode: '3',
        message: '服务器错误',
      });
    } else if (result.length != 0) {
      res.json({
        retCode: '0',
        message: '查询成功',
        length: result.length,
        data: result.slice(n,n+10)
      });
    } else {
      res.json({
        retCode: '1',
        message: '没有对应数据',
      });
    }
    // 释放连接
  });
});

/* 改变申请状态. */
router.post('/toApply', function (req, res, next) {
  var apply_state = req.body.apply_state;
  var state = 0;
  if(apply_state==0){
    state = 1
  }else {
    state = 0
  }
  var id = req.body.id;
  connection.query(
      'UPDATE apply SET apply_state='+ state +' WHERE id = "' + id + '"',
      function (err, result) {
        if (err) {
          console.log(err)
          res.json({
            retCode: '3',
            message: '服务器错误，请稍后尝试',
          });
        } else if (result.length != 0) {
          res.json({
            retCode: '0',
            message: '修改状态成功',
          });
        } else {
          res.json({
            retCode: '1',
            message: '修改状态失败，请稍后尝试',
          });
        }

        // 释放连接
      });
});


/* 删除申请. */
router.post('/deleteApply', function (req, res, next) {
  var id = req.body.id;
  var sql = 'DELETE FROM apply WHERE id='+id;
  connection.query(
      sql,
      function (err, result) {
        if (err) {
          console.log(err)
          res.json({
            retCode: '3',
            message: '服务器错误',
          });
        } else if (result) {
          res.json({
            retCode: '0',
            message: '删除成功',
            data: result
          });
        }
        // 释放连接
      });
});
module.exports = router;
