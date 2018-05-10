var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var config = require("../common/config")
var errors = require("../common/errors")
var mongoose = require("mongoose");
var fs = require("fs");
var formidable = require('formidable');
var qiniuyun = require("qiniu");


/**
 * 上传图片
 */
router.post("/uploadimages", function (req, res, next) {
    var form = new formidable.IncomingForm();                   //创建上传表单
    form.encoding = 'utf-8';		                            //设置编辑
    form.uploadDir = config.siteUrl+'/uploads/';	            //设置上传目录
    form.keepExtensions = true;	                                //保留后缀
    form.maxFieldsSize = 2 * 1024 *1024;                        //文件大小
    var files=[],fields=[],docs=[];

    form.on('error', function(err) {
        if (err){
            console.log("出错啦");
        }
    }).on('field', function(field, value) {
        fields.push([field, value]);
    }).on('file', function(field, file) {
        files.push([field, file]);
        docs.push(file);
        var extension = file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLowerCase();
        if (file.size > 2*2048*2048){               //如果图片大于2M
            fs.unlink(file.path);
            res.status(200).json(errors.error6);
        }else if((extension !== '.jpg')&&(extension !== '.png')&&(extension !== '.gif')&&(extension !== '.jpeg')){                                 //如果上传的图片格式不是jpg,png,gif
            fs.unlink(file.path);
            res.status(200).json(errors.error7);
        }else {                                     //开始上传
            var date = new Date();
            var newFileName = "shangchao_"+Date.parse(date)+functions.createVercode(6) +extension;
            //上传到七牛云
            functions.saveToQiniu(file.path,newFileName,function (err, ret) {
                if (!err){
                    // 上传成功，删除源文件
                    fs.unlink(file.path);
                    //处理返回值
                    var ret1 = errors.error0;
                    ret1.data = ret;
                    res.status(200).json(ret1);
                }else{
                    console.log("上传图片到七牛云出错了");
                    // 上传失败， 处理返回代码
                    var ret2 = errors.error0;
                    ret2.data = '/' + newFileName;
                    res.status(200).json(ret2);
                }
            });
        }

    }).on('end', function() {

    });

    form.parse(req, function(err, fields, files) {
        err && console.log('formidabel error : ' + err);
    });

});


/**
 * 获得七牛云上传签名
 * @type {core.Router}
 */
router.get("/getqnuploadsign/:filename/:sign",function (req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res) {
    qiniuyun.conf.ACCESS_KEY = config.qiniu.accessKey;
    qiniuyun.conf.SECRET_KEY = config.qiniu.secretKey;

    var scope=config.qiniu.bucket+":"+req.params.filename;

    var putPolicy = new qiniuyun.rs.PutPolicy(scope,null, null, null, null, null, 3600, null, null);
    var uptoken = putPolicy.token();
    var ret = errors.error0;
    ret.data = {
        sign:uptoken,
        qiniuurl:config.qiniu.url
    };
    res.json(ret);
});


/**
 * wangeditor上传图片
 */
router.post("/wangeditor_uploadimages", function (req, res, next) {
    var form = new formidable.IncomingForm();                   //创建上传表单
    form.encoding = 'utf-8';		                            //设置编辑
    form.uploadDir = config.siteUrl+'/uploads/';	            //设置上传目录
    form.keepExtensions = true;	                                //保留后缀
    form.maxFieldsSize = 2 * 1024 *1024;                        //文件大小
    var files=[],fields=[],docs=[];

    form.on('error', function(err) {
        if (err){
            console.log("出错啦");
        }
    }).on('field', function(field, value) {
        fields.push([field, value]);
    }).on('file', function(field, file) {
        files.push([field, file]);
        docs.push(file);
        var extension = file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLowerCase();
        if (file.size > 2*2048*2048){               //如果图片大于2M
            fs.unlink(file.path);
            res.end("error|图片大小不能超过2M");
        }else if((extension !== '.jpg')&&(extension !== '.png')&&(extension !== '.gif')&&(extension !== '.jpeg')){                                 //如果上传的图片格式不是jpg,png,gif
            fs.unlink(file.path);
            res.end("error|只允许上传jpg、png、gif格式的图片");
        }else {                                     //开始上传
            var date = new Date();
            var newFileName = "shop_"+Date.parse(date)+functions.createVercode(6) +extension;

            //上传到七牛云
            functions.saveToQiniu(file.path,newFileName,function (err, ret) {
                if (!err){
                    // 上传成功，删除源文件
                    fs.unlink(file.path);
                    //处理返回值
                    res.end(ret);
                }else{
                    console.log("上传图片到七牛云出错了");
                    // 上传失败， 处理返回代码
                    res.end("error|服务器端错误");
                }
            });
        }

    }).on('end', function() {

    });

    form.parse(req, function(err, fields, files) {
        err && console.log('formidabel error : ' + err);
    });
});
module.exports = router;