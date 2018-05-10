var express = require('express');
var router = express.Router();
var config = require("../common/config")
var errors = require("../common/errors")
var functions = require('../common/functions');
var mongoose = require("mongoose");
var xlsx = require('node-xlsx');
var fs = require('fs');
var request = require('request');
var date = require("../common/date");
var md5 = require('md5');
var formidable = require('formidable');
var async = require("async");
var Ticket = mongoose.model("Ticket");


/*订单列表*/
router.get('/', function(req, res, next) {
    var user = req.session.user;
    if(user){
        var pagesize = 10;
        var counturl = "/admin/getOrder/1/" + pagesize + '/1';
        var dataurl = "/admin/getOrder/2/" + pagesize;
        var renderParams = Object.assign({}, req.body._params, {
            pagesize: pagesize,
            counturl: counturl,
            dataurl: dataurl,
        });
        res.render("adminIndex",renderParams)

    }else {
        res.render("login",{title:'康陪'})
    }
});

/*查询订单列表*/
router.get('/getOrder/:type/:pagesize/:page',function (req,res,next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch (req.params.type) {
        case '1':
            Ticket.count({
                isSale:1
            }).exec(function (err, docs) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                } else {
                    res.status(200).json(docs);
                }
            })
            break;
        case '2':
            Ticket.find({isSale:1},function (err,doc) {
                if (err) {
                    res.status(200).json(errors.error3)
                } else {
                    var data = [];
                    for (var i = 0; i < doc.length; i++) {
                        var ticketType;
                        var channel;
                        var way;
                        if (doc[i].ticketType == 1) {
                            ticketType = '学生票';
                        } else if (doc[i].ticketType == 2) {
                            ticketType = '成人票';
                        } else if (doc[i].ticketType == 2) {
                            ticketType = 'vip票';
                        }
                        if (doc[i].channel == 1) {
                            channel = '京东线下提货点'
                        } else if (doc[i].channel == 2) {
                            channel = '雷锋哥'
                        }
                        if (doc[i].way == 'WeiXIN') {
                            way = '微信'
                        } else if (doc[i].way == 'Alipay') {
                            way = '支付宝'
                        }
                        var createTime = date.formatDateTime(doc[i].createTime);
                        var saleTime = date.formatDateTime(doc[i].saleTime)
                        var obj = {
                            ticketNo: doc[i].ticketNo,
                            ticketType: ticketType,
                            price: doc[i].price,
                            name: doc[i].name,
                            identity: doc[i].identity,
                            orderNo: doc[i].orderNo,
                            channel: channel,
                            way: way,
                            saleTime: saleTime,
                            createTime: createTime
                        }
                        data.push(obj)
                    }

                    res.status(200).json(data)
                }
            })
            break;
    }


})

/*导入票数据*/
router.post('/upTicket', function(req, res, next) {
    var form = new formidable.IncomingForm();                   //创建上传表单
    form.encoding = 'utf-8';		                            //设置编辑
    form.uploadDir = config.rootDir + '/public/tempfiles/';	            //设置上传目录
    form.keepExtensions = true;	                                //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;                        //文件大小
    var files = [], fields = [], docs = [];

    form.parse(req, function(err, fields, files) {
    });

    form.on('error', function (err) {
        if (err) {
            console.log("出错啦");
        }
    }).on('field', function (field, value) {
        fields.push([field, value]);
    }).on('file', function (field, file) {
        files.push([field, file]);
        docs.push(file);
        var extension = file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLowerCase();
        if (file.size > 2 * 2048 * 2048) {               //如果文件大于2M
            fs.unlink(file.path);
            res.status(200).json(errors.error6);
        } else if ((extension !== '.xls') && (extension !== '.xlsx')) {                                 //如果上传的文件格式不是xls,xlsx
            fs.unlink(file.path);
            res.status(200).json(errors.error7);
        } else {
            var fileId =   Math.round(+new Date() / 1000) + functions.createVercode(4)
            var oldpath=file.path;
            var newpath=file.path.substring(file.path.lastIndexOf('/')+1, -1)+fileId+file.name.substring(file.name.lastIndexOf('.'), file.name.length);
            var filename;
            fs.rename(oldpath,newpath,function (err) {
                if(err){
                    filename=oldpath
                }else{
                    filename =newpath
                }
                req.body.filename = filename;
                next();
            });

        }
    })
},function (req,res,next) {
//     // 读取内容，写入数据库
    var user=req.session.user
    var fileRootName = req.body.filename;
    var obj = xlsx.parse(fileRootName);
    var excelObj=obj[0].data;
    if((excelObj[0].length != 3)||(excelObj[0][0] != '票号')||(excelObj[0][1] != '票类')||(excelObj[0][2] != '价格')){
        fs.unlink(fileRootName);
        //模版不正确
        res.json(errors.error8);
    }else {
        excelObj.shift()
        excelObj.pop()
        excelObj = functions.arrayUniq(excelObj)
        // console.log(excelObj)
        var async = require('async')

        async.each(excelObj, function(x, callback) {
            var type;
            if(x[1]=="学生票"){
                type=1
            }else if(x[1]=="成人票"){
                type=2
            }else if(x[1]=="vip票"){
                type=3
            }
            var obj={
                ticketNo:x[0],
                ticketType:type,
                price:x[2]
            }
            Ticket.findOne({ticketNo:x[0]},function (err,docs) {
                if(err){
                    callback(null)
                }else {
                    if(docs){
                        callback(null)
                    }else {
                        var ticket=new Ticket(obj)
                        ticket.save(function (err,doc) {
                            if(err){
                                callback(null)
                            }else {
                                callback(null)
                            }
                        })
                    }
                }
            })

        }, function(err) {
            if(err){
                res.status(200).json(errors.error3)
            }else {
                res.status(200).json(errors.error0);
            }

        })
    }
});




router.get('/dd',function (req,res) {
    Ticket.find({},function (err,doc) {
        res.send(doc)
    })
})



module.exports = router;
