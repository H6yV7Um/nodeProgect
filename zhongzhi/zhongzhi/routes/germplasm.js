var express = require('express');
var router = express.Router();
var config = require('../common/config');
var functions = require('../common/functions');
var mysql = require('mysql');
var md5 = require('md5');
var dbConfig = require('../common/Dbconfig');
var date = require('../common/date');
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


/* 查询种质资源列表. */
router.get('/query/:name/:page', function (req, res, next) {
    var name = req.params.name;
    var page = req.params.page;
    var n = page == 1 ? 0 : 10 * page - 10;
    connection.query(
        'SELECT * FROM ' + name,
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

/* 查询种质资源列表. */
router.post('/searchQuery/:name/:page', function (req, res, next) {
    var uniform_number = req.body.uniform_number;
    var cultivar_name = req.body.cultivar_name;
    var name = req.params.name;
    var page = req.params.page;
    var n = page == 1 ? 0 : 10 * page - 10;
    connection.query(
        'SELECT * FROM ' + name + ' WHERE uniform_number LIKE "%'+uniform_number+'%" AND cultivar_name LIKE "%'+cultivar_name+'%"' ,
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

/* 编辑种质资源列表. */
router.get('/getGermplasm/:name/:id', function (req, res, next) {
    var name = req.params.name;
    var id = req.params.id;
    connection.query(
        'SELECT * FROM ' + name + ' WHERE id = ' + id,
        function (err, result) {
            if (err) {
                res.json({
                    retCode: '3',
                    message: '服务器错误',
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

/* 编辑种质资源列表-提交. */
router.post('/updataGermplasm/:name/:id', function (req, res, next) {
    var name = req.params.name;
    var id = req.params.id;
    var body = req.body;
    var fieldNameArr = [], valArr = [];
    for(var i in body){
        if(body.hasOwnProperty(i)){
            fieldNameArr.push(i);
            valArr.push(body[i]);
        }
    }
    var sql = 'UPDATE ' + name + ' SET ';
    for(var j=0;j<fieldNameArr.length;j++){
        sql+= fieldNameArr[j] + '="' + valArr[j] + '", '
    }
    if (sql.substr(sql.length - 2, sql.length) == ", ") {
        sql = sql.substring(0, sql.length - 2);
    }
    sql += ' WHERE id="'+id+'";';
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

/* 新增种质列表. */
router.get('/addGermplasmQuery/:name', function (req, res, next) {
    var name = req.params.name;
    var data = functions.getDataByName(name);
    res.json({
        retCode: '0',
        message: '成功',
        data:data
    });
});

/* 新增种质列表-提交. */
router.post('/addGermplasm/:name', function (req, res, next) {
    var name = req.params.name;
    var body = req.body;
    var fieldNameArr = [], valArr = [],uniform_number='';
    for(var i in body){
        var val = body[i].val;
        if(body[i].val=='请选择。。。'){
            val = ''
        }
        if(body[i].fieldName=='uniform_number'){
            uniform_number = body[i].val
        }
        if(val!=''){
            fieldNameArr.push(body[i].fieldName);
            valArr.push(val);
        }
    }
    var sql1 = 'SELECT * FROM uniform WHERE uniform_number="'+uniform_number + '"'
    connection.query(
        sql1,
        function (err,result) {
            if(err){
                console.log(err)
                res.json({
                    retCode: '3',
                    message: '服务器错误',
                });
            }else if(result.length!=0){
                res.json({
                    retCode: '1',
                    message: '已有统一编号，请重新设置',
                });
            }else {
                var sql = 'INSERT INTO  ' + name + ' (';
                var uniform_number = '';
                for(var j=0;j<fieldNameArr.length;j++){
                    sql += fieldNameArr[j] + ', '
                    if(fieldNameArr[j]=='uniform_number'){
                        uniform_number = valArr[j]
                    }
                }
                if (sql.substr(sql.length - 2, sql.length) == ", ") {
                    sql = sql.substring(0, sql.length - 2);
                }
                sql += ',data_type) VALUES (';
                for(var n=0;n<fieldNameArr.length;n++){
                    sql += '"'+ valArr[n] + '", '
                }
                if (sql.substr(sql.length - 2, sql.length) == ", ") {
                    sql = sql.substring(0, sql.length - 2);
                }
                sql += ',"s")';
                console.log(sql)
                connection.query(sql,function (err,result) {
                    if (err) {
                        console.log(err)
                        res.json({
                            retCode: '3',
                            message: '服务器错误',
                        });
                    } else if (result.length != 0) {
                        res.json({
                            retCode: '0',
                            message: '添加成功',
                            data: result
                        });
                    }
                })
                var sql2 = 'INSERT INTO uniform(uniform_number) VALUES ("' + uniform_number + '")';
                connection.query(sql2,function (err,result) {
                    if (err) {
                        console.log(err)
                    } else if (result.length != 0) {
                        console.log("插入成功")
                    }
                })
            }
        }
    )
});

/* 删除种质列表. */
router.post('/deleteGerm', function (req, res, next) {
    var name = req.body.name;
    var id = req.body.id;
    var uniform_number = req.body.uniform_number;
    var sql = 'DELETE FROM ' + name + ' WHERE id='+id;
    var sql1 = 'DELETE FROM uniform WHERE uniform_number='+uniform_number;
    connection.query(sql,function (err,result) {
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
    })
    connection.query(sql1,function (err,result) {
        if (err) {
            console.log(err)
        } else if (result) {
            console.log('删除成功')
        }
    })
});

/* 新增种质列表统一编号. */
router.get('/addNumber/:name', function (req, res, next) {
    var name = req.params.name;
    var sql = 'SELECT uniform_number FROM ' + name + ' LIMIT 50';
    connection.query(sql,function (err,result) {
        if (err) {
            console.log(err)
            res.json({
                retCode: '3',
                message: '服务器错误',
            });
        } else if (result.length != 0) {
            res.json({
                retCode: '0',
                message: '成功',
                data: result
            });
        } else {
            res.json({
                retCode: '1',
                message: '没有对应数据',
            });
        }
    })
});

/* 新增种质图片. */
router.post('/addPicInfo', function (req, res, next) {
    var name = req.body.name;
    var number = req.body.number;
    var url = req.body.url;
    var sql = 'INSERT INTO image (uniform_number,crop_name,url,time_stamp) VALUES ("' +number +'","'+name+'","'+url+'","'+Date.now()+'")';
    connection.query(sql,function (err,result) {
        if (err) {
            console.log(err)
            res.json({
                retCode: '3',
                message: '服务器错误',
            });
        } else if (result.length != 0) {
            res.json({
                retCode: '0',
                message: '成功',
                data: result
            });
        } else {
            res.json({
                retCode: '1',
                message: '没有对应数据',
            });
        }
    })
});

/* 查看种质图片. */
router.post('/getPic/:page', function (req, res, next) {
    var page = req.params.page;
    var n = page == 1 ? 0 : 16 * page - 16;
    var name = req.body.name;
    var sql = 'SELECT * FROM image WHERE crop_name="'+name +'"';
    connection.query(sql,function (err,result) {
        if (err) {
            console.log(err)
            res.json({
                retCode: '3',
                message: '服务器错误',
            });
        } else if (result.length != 0) {
            var data = [];
            for(var i=0;i<result.length;i++){
                data.push({
                    id:result[i].id,
                    crop_name:result[i].crop_name,
                    time_stamp:date.formatDateTime(new Date(result[i].time_stamp)),
                    uniform_number:result[i].uniform_number,
                    url:result[i].url,
                })
            }
            res.json({
                retCode: '0',
                message: '获取图片信息成功',
                data: result.slice(n,n+16),
                length:result.length
            });
        } else if(result.length == 0){
            res.json({
                retCode: '1',
                message: '没有图片信息数据',
            });
        }
    })
});


/* 查询种质资源图片列表. */
router.get('/queryPic/:name/:page', function (req, res, next) {
    var name = req.params.name;
    var page = req.params.page;
    var n = page == 1 ? 0 : 10 * page - 10;
    connection.query(
        'SELECT * FROM image WHERE crop_name="' + name + '"',
        function (err, result) {
            if (err) {
                console.log(err)
                res.json({
                    retCode: '3',
                    message: '服务器错误',
                });
            } else if (result.length != 0) {
                var data = [];
                for(var i=0;i<result.length;i++){
                    data.push({
                        id:result[i].id,
                        uniform_number:result[i].uniform_number,
                        crop_name:result[i].crop_name,
                        url:'<img class="table-img" src="'+result[i].url + '"/>',
                        time_stamp:date.formatDateTime(new Date(parseInt(result[i].time_stamp))),
                    })
                }
                res.json({
                    retCode: '0',
                    message: '查询成功',
                    length: data.length,
                    data: data.slice(n,n+10)
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


/* 删除种质图片. */
router.post('/deleteGermPic', function (req, res, next) {
    var id = req.body.id;
    var sql = 'DELETE FROM image WHERE id='+id;
    connection.query(sql,function (err,result) {
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
    })
});


module.exports = router;
