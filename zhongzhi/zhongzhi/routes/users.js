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


/* 查询用户列表. */
router.get('/userList/:page', function (req, res, next) {
  var page = parseInt(req.params.page);
  var n = page==1?0:10*page-11;
  connection.query(
      'SELECT * FROM users',
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

/* 删除用户. */
router.post('/deleteUser', function (req, res, next) {
  var id = req.body.id;
  var sql = 'DELETE FROM users WHERE id='+id;
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



/* 后台登录. */
router.post('/login', function (req, res, next) {
  var user = req.body.user;
  var password = req.body.password;
  connection.query(
      'SELECT * FROM admin WHERE account = ? AND pwd = ? ',
      [user,password],
      function (err, result) {
        if (err) {
          res.json({
            retCode: '3',
            message: '服务器查询错误',
          });
        } else if (result.length != 0) {
          console.log(result)
          res.json({
            retCode: '0',
            message: '登陆成功',
            data:result[0]
          });
        } else {
          res.json({
            retCode: '1',
            message: '用户名或密码错误',
          });
        }


        // 释放连接

      });
});


/* 后台获取用户信息. */
router.get('/getUser/:id', function (req, res, next) {
    var id = req.params.id;
    connection.query(
        'SELECT * FROM users WHERE id='+id,
        function (err, result) {
            if (err) {
                res.json({
                    retCode: '3',
                    message: '服务器查询错误',
                });
            } else if (result.length != 0) {
                console.log(result)
                res.json({
                    retCode: '0',
                    message: '获取成功',
                    data:result[0]
                });
            } else {
                res.json({
                    retCode: '1',
                    message: '用户名或密码错误',
                });
            }

            // 释放连接
        });
});

/* 后台用户信息-提交. */
router.post('/updateUser', function (req, res, next) {
    var id = req.body.id;
    var name = req.body.name;
    var tel = req.body.tel;
    var mail = req.body.mail;
    var unit = req.body.unit;
    var id_number = req.body.id_number;
    var address = req.body.address;
    var mailCode = req.body.mailCode;
    var sql = 'UPDATE users SET name="'+name+'", unit="'+unit+'", tel="'+tel+'", id_number="'+id_number+'", address="'+address+'", mailCode="'+mailCode+'", mail="'+mail+'", mail="'+mail+'" WHERE id='+id
    console.log(sql)
    connection.query(
        sql,
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
                    message: '修改成功',
                    data: result
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


/* 后台修改密码-提交. */
router.post('/recode', function (req, res, next) {
    var passwordOri = req.body.passwordOri;
    var newPassword = req.body.newPassword;
    var newPasswordAgain = req.body.newPasswordAgain;
    connection.query('SELECT * FROM admin WHERE id="1"',function (err,data) {
        if (err) {
            res.json({
                retCode: '3',
                message: '服务器错误',
            });
        } else if (data.length != 0) {
            if(data[0].pwd != passwordOri){
                res.json({
                    retCode: '2',
                    message: '旧密码输入错误',
                });
            }else {
                var sql = 'UPDATE admin SET pwd="'+newPasswordAgain+'" WHERE id="1"';
                connection.query(
                    sql,
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
                                message: '修改成功',
                                data: result
                            });
                        } else {
                            res.json({
                                retCode: '1',
                                message: '没有对应数据',
                            });
                        }
                        // 释放连接
                    });
            }
        } else {
            res.json({
                retCode: '1',
                message: '没有对应数据',
            });
        }
    })
});




module.exports = router;
