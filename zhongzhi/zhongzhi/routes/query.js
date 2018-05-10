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

/* 查询页面. */
router.get('/:name', function (req, res, next) {
    var name = req.params.name;
    var data = functions.getDataByName(name);
    var result = [];
    for (var i = 0, len = data.length; i < len; i += 3) {
        result.push(data.slice(i, i + 3));
    }
    res.json({
        data: result,
        dataInfo: data
    });
});
/* 查询页面. */
router.get('/getDataList/:name/:page', function (req, res, next) {
    var name = req.params.name;
    var page = req.params.page;
    var n = page == 1 ? 0 : 20 * page - 20;
    var sql = 'SELECT * FROM ' + name;
    connection.query(sql, function (err, result) {
        if (err) {
            res.json({
                retCode: '3',
                message: '服务器错误',
            });
        } else if (result.length != 0) {
            res.json({
                retCode: '0',
                message: '查询成功',
                length: result.length,
                data: result.slice(n,n+20)
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
/* 分类查询. */
router.post('/test/:page', function (req, res, next) {
    //查询信息
    var info = req.body.info;
    //页数
    var page = req.params.page;
    var newArr = [];
    for (var i = 0; i < info.length; i++) {
        newArr = newArr.concat(info[i])
    }
    var name = req.body.name;
    // 获取前台页面传过来的参数
    var sql = 'SELECT * FROM ' + name + ' WHERE ';
    for (var i in newArr) {
        switch (newArr[i].type) {
            case 'text':
                if (newArr[i].val != '') {
                    sql += newArr[i].fieldName + ' LIKE "%' + newArr[i].val + '%"';
                    sql += ' AND '
                }
                break;
            case 'compare':
                if (newArr[i].val != '') {
                    switch (newArr[i].sel) {
                        case '=':
                            sql += newArr[i].fieldName + ' = ' + newArr[i].val;
                            break;
                        case '>':
                            sql += newArr[i].fieldName + ' > ' + newArr[i].val;
                            break;
                        case '<':
                            sql += newArr[i].fieldName + ' < ' + newArr[i].val;
                            break;
                        case '>=':
                            sql += newArr[i].fieldName + ' >= ' + newArr[i].val;
                            break;
                        case '<=':
                            sql += newArr[i].fieldName + ' <= ' + newArr[i].val;
                            break;
                        case '<>':
                            sql += newArr[i].fieldName + ' <> ' + newArr[i].val;
                            break;
                        default:
                            sql += newArr[i].fieldName + ' = ' + newArr[i].val;
                            break;
                    }
                    sql += ' AND '
                }
                break;
            case 'select':
                if (newArr[i].val != '请选择。。。') {
                    sql += newArr[i].fieldName + ' = "' + newArr[i].val + '"';
                    sql += ' AND '
                }
                break;
            default:
                if (newArr[i].val != '') {
                    sql += newArr[i].fieldName + ' LIKE "' + newArr[i].val + '"';
                    sql += ' AND '
                }
                break;
        }
    }
    // 建立连接 增加一个用户信息
    if (sql.substr(sql.length - 6, sql.length) == "WHERE ") {
        sql = sql.substring(0, sql.length - 6);
    }
    if (sql.substr(sql.length - 5, sql.length) == " AND ") {
        sql = sql.substring(0, sql.length - 5);
    }
    // sql += ' LIMIT ' + page + ',1'
    connection.query(sql, function (err, result) {
        if (err) {
            res.json({
                retCode: '3',
                message: '服务器错误',
            });
        } else if (result.length != 0) {
            res.json({
                retCode: '0',
                message: '查询成功',
                length: result.length,
                data: [result[page - 1]]
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

/*查看详情*/
router.post('/getDataInfo', function (req, res, next) {
    //查询信息
    var id = req.body.id;
    var name = req.body.name;
    var sql = 'SELECT * FROM ' + name + ' WHERE id=' + id;
    connection.query(
        sql,
        function (err, result) {
            if (err) {
                res.json({
                    retCode: '3',
                    message: '服务器查询错误',
                });
            } else if (result.length != 0) {
                res.json({
                    retCode: '0',
                    message: '查询成功',
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
/*注册*/
router.post('/register', function (req, res, next) {
    var account = req.body.account;
    var tel = req.body.tel;
    var passwd = req.body.passwd;
    var passwdCheck = req.body.passwdCheck;
    var unit = req.body.unit;
    if (passwd != passwdCheck) {
        res.json({
            retCode: '1',
            message: '两次密码不相同',
        });
    } else {
        connection.query(
            'SELECT * FROM users WHERE account = ? OR tel = ? ',
            [account, tel],
            function (err, result) {
                if (err) {
                    res.json({
                        retCode: '3',
                        message: '服务器查询错误',
                    });
                } else if (result.length != 0) {
                    res.json({
                        retCode: '2',
                        message: '账号或手机号已被注册',
                    });
                } else {
                    connection.query(
                        'INSERT INTO users(account,password,tel,unit,time_stamp) VALUES(?,?,?,?,?)',
                        [account, md5(md5(passwd) + config.userSalt), tel, unit, Date.now()],
                        function (err, doc) {
                            if (err) {
                                res.json({
                                    retCode: '3',
                                    message: '服务器插入错误',
                                });
                            } else if (doc) {
                                res.json({
                                    retCode: '0',
                                    message: '注册成功',
                                });
                            }
                        })
                }


                // 释放连接

            });
    }
});


/*登录*/
router.post('/login', function (req, res, next) {
    var account = req.body.account;
    var password = req.body.password;
    console.log(md5(md5(password)+config.userSalt))
    connection.query(
        'SELECT * FROM users WHERE (account = ? OR tel = ?) AND password = ? ',
        [account,account,md5(md5(password)+config.userSalt)],
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


/*提交种质资源申请*/
router.post('/submitQuery', function (req, res, next) {
    var name = req.body.name;
    var id_number = req.body.id_number;
    var unit = req.body.unit;
    var tel = req.body.tel;
    var address = req.body.address;
    var mailCode = req.body.mailCode;
    var mail = req.body.mail;
    var cropName = req.body.cropName;
    var cropNameInfo = req.body.cropNameInfo;
    var useInfo = req.body.useInfo;
    var id = req.body.id;
    connection.query(
        'INSERT INTO apply(user_id,name,id_number,unit,tel,address,mail_code,mail,crop_name,crop_name_info,user_info,time_stamp) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
        [id, name, id_number, unit,tel,address,mailCode,mail,cropName,cropNameInfo,useInfo, Date.now()],
        function (err, result) {
            if (err) {
                console.log(err)
                res.json({
                    retCode: '3',
                    message: '服务器操作错误，请稍后重试',
                });
            } else if (result.length != 0) {
                res.json({
                    retCode: '0',
                    message: '提交成功',
                    data:result[0]
                });
            } else {
                res.json({
                    retCode: '1',
                    message: '提交错误，请稍后重试',
                });
            }

            // 释放连接
        });
});

/* 申请列表. */
router.get('/getApply/:id/:page', function (req, res, next) {
    var id = req.params.id;
    var page = parseInt(req.params.page);
    var n = page==1?0:10*page-11;
    connection.query(
        'SELECT * FROM apply WHERE user_id='+id,
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


/* 统计页面. */
router.post('/getKeys', function (req, res, next) {
    var name = req.body.name;
    var data = functions.getDataByName(name);
    var result = [];
    for (var i = 0, len = data.length; i < len; i += 1) {
        if(data[i].type=='compare'){
            result.push({
                fieldName:data[i].fieldName,
                chineseName:data[i].chineseName,
            });
        }
    }
    res.json({
        retCode:'0',
        data: result,
    });
});
/* 统计页面. */
router.post('/getResult', function (req, res, next) {
    var anaSel = req.body.anaSel;
    var name = req.body.name;
    var sql = 'SELECT count(*) as count, max('+anaSel+') as max, min('+anaSel+') as min, AVG('+anaSel+') as avg, STD('+anaSel+') as std FROM '+ name;
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
                console.log(result)
                res.json({
                    retCode: '0',
                    message: '查询成功',
                    data:result[0]
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

/* 修改个人信息. */
router.post('/editMine', function (req, res, next) {
    var name = req.body.name;
    var unit = req.body.unit;
    var tel = req.body.tel;
    var id_number = req.body.id_number;
    var address = req.body.address;
    var mailCode = req.body.mailCode;
    var mail = req.body.mail;
    var avatar_url = req.body.avatar;
    var id = req.body.id;
    var sql = 'UPDATE users SET name="'+name+'", unit="'+unit+'", tel="'+tel+'", id_number="'+id_number+'", address="'+address+'", mailCode="'+mailCode+'", mail="'+mail+'", avatar_url="'+avatar_url+'" WHERE id='+id
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


/* 修改个人信息. */
router.post('/recode', function (req, res, next) {
    var passOri = req.body.passOri;
    var password = req.body.passwd;
    var passwdCheck = req.body.passwdCheck;
    if(password!=passwdCheck){
        res.json({
            retCode: '2',
            message: '新旧密码不一致，请重新输入',
            data: result
        });
    }else {
        var id = req.body.id;
        connection.query('SELECT password FROM users WHERE id='+id,
            function (err, result) {
                if (err) {
                    console.log(err)
                    res.json({
                        retCode: '3',
                        message: '服务器错误',
                    });
                } else{
                    console.log(result[0].password)
                    console.log(md5(md5(passOri)+config.userSalt))
                    if(result[0].password!=md5(md5(passOri)+config.userSalt)){
                        res.json({
                            retCode: '1',
                            message: '旧密码错误，请重新输入',
                            data: result
                        });
                    }else if(result[0].password==md5(md5(passwdCheck)+config.userSalt)){
                        res.json({
                            retCode: '1',
                            message: '新旧密码不能相同，请重新输入',
                            data: result
                        });
                    }else {
                        var sql1 = 'UPDATE users SET password="'+md5(md5(passwdCheck)+config.userSalt)+'" WHERE id=' +id;
                        connection.query(
                            sql1,
                            function (err, result) {
                                if (err) {
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
                }

                // 释放连接
            });
    }
});
module.exports = router;
