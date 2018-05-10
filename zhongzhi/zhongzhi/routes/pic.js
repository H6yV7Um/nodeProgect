var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var config = require("../common/config")
var errors = require("../common/errors")
var fs = require("fs");
var formidable = require('formidable');


/**
 * 上传图片
 */
router.post("/uploadimages", function (req, res, next) {
    console.log('00000')
    var form = new formidable.IncomingForm();                   //创建上传表单
    console.log("2222")
    form.encoding = 'utf-8';		                            //设置编辑
    console.log('1111')
    form.uploadDir = config.siteUrl+'/uploads/';	            //设置上传目录
    console.log('1111')
    form.keepExtensions = true;	                                //保留后缀
    console.log('1111')
    form.maxFieldsSize = 2 * 1024 *1024;                        //文件大小
    console.log('1111')
    var files=[],fields=[],docs=[];

    console.log('1111')
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
            /*生成文件名*/
            var fileId =   Math.round(+new Date() / 1000) + functions.createVercode(4) + extension;
            //上传到七牛云
            functions.uploadPicToWxyt(file.path, fileId, function (err, ret) {
                if (!err) {
                    var filename = config.wxytConfig.wxytUrl + '/' +fileId

                    // 上传成功，删除源文件
                    fs.unlink(file.path, function () {
                    })
                    // console.log(filename)
                    // 上传成功，删除源文件
                    //处理返回值
                    var ret1 = errors.error0;
                    ret1.data = filename;
                    res.status(200).json(ret1);
                }else{
                    console.log("上传图片到万象有图出错了");
                    // 上传失败， 处理返回代码
                    var ret2 = errors.error0;
                    ret2.data = '/' + fileId;
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


module.exports = router;