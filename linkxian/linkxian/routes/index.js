var express = require('express');
var router = express.Router();
var xlsx = require('node-xlsx');
var fs = require('fs');
var md5 = require('md5')
var formidable = require('formidable');
var config = require('../common/config');
var functions = require('../common/functions');
var errors = require('../common/errors');

router.get("/fdsy",function(req,res){
    req.models.User.find({
        username:'admin',
    }, function (err, docs) {
        console.log(docs)
        res.send(docs)
    })
})

/* 异业营销置换表单提交 */
router.post('/add_marketing_exchange', function(req, res, next) {
    req.models.Marketing.create({
        type:req.body.type,                                //品类
        shopname:req.body.shopname,                            //店名
        address:req.body.address,                             //地址
        latitude:req.body.latitude,                          //纬度
        longitude:req.body.longitude,                         //经度
        phone:req.body.phone,                               //电话
        exchange_intention:req.body.exchange_intention,                  //置换意向
        picurl:req.body.picurl,                              //图片
        start_time:req.body.start_time,                       //开始时间
        end_time:req.body.end_time,                         //结束时间
        status:0,                           //状态。0未审批；1审批通过
        create_time:parseInt(Date.now()/1000),                      //创建时间
    }, function (err, docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            res.status(200).json({
                error:0,
                message:'success',
                data:docs
            });
        }
    })
});

/* 附近优惠表单提交 */
router.post('/add_benefit', function(req, res, next) {
    req.models.Benefit.create({
        type:req.body.type,                                //品类
        shopname:req.body.shopname,                            //店名
        address:req.body.address,                             //地址
        latitude:req.body.latitude,                          //纬度
        longitude:req.body.longitude,                         //经度
        phone:req.body.phone,                               //电话
        benefit:req.body.benefit,                  //优惠内容
        picurl:req.body.picurl,                              //图片
        start_time:req.body.start_time,                       //开始时间
        end_time:req.body.end_time,                         //结束时间
        status:0,                           //状态。0未审批；1审批通过
        create_time:parseInt(Date.now()/1000),                      //创建时间
    }, function (err, docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            res.status(200).json({
                error:0,
                message:'success',
                data:docs
            });
        }
    })
});


router.get("/nearby_favourable/:lat/:lng",function(req,res){
    //34.220546   108.953364
    req.models.Bannerads.find({}, function (err, banner) {
        if(err){
            res.send(err)
        }else{
            req.models.Benefit.find({}, function (err, docs) {
                if(err){

                }else{
                    var data = []
                    for(var i=0;i<docs.length;i++){
                        var obj = {
                            distance:0
                        }
                        var json = eval('(' + (JSON.stringify(docs[i]) + JSON.stringify(obj)).replace(/}{/, ',') + ')');
                        data.push(json)
                    }

                    var lat1 = req.params.lat;
                    var lng1 = req.params.lng;
                    for(var x=0;x<data.length;x++){
                        var lat2 = data[x].latitude
                        var lng2 = data[x].longitude
                        data[x].distance = functions.getFlatternDistance(lat1, lng1, lat2, lng2)
                    }
                    var arr = functions.sortByKey(data,'distance',2)
                    res.render('myNearby');
                    res.status(200).json({
                        error:0,
                        message:'success',
                        data:{
                            banner:banner,
                            shop:arr
                        }
                    });
                }
            })

        }

    });
})
/**
 * 上传图片
 */
router.post("/uploadimg",function(req,res) {
    console.log('+++++++++++++++++')
    console.log(req.body)
    var form = new formidable.IncomingForm();                   //创建上传表单
    form.encoding = 'utf-8';		                            //设置编辑
    form.uploadDir = config.siteUrl + '/uploads/';	            //设置上传目录
    form.keepExtensions = true;	                                //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;                        //文件大小
    var files = [], fields = [], docs = [];

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
        if (file.size > 2 * 2048 * 2048) {               //如果图片大于2M
            fs.unlink(file.path);
            res.status(200).json(errors.error6);
        } else if ((extension !== '.jpg') && (extension !== '.png') && (extension !== '.gif') && (extension !== '.jpeg')) {                                 //如果上传的图片格式不是jpg,png,gif
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
                var ret1 = errors.error0;
                ret1.data = filename;
                res.status(200).json(ret1);
            });

        }
    })
})


module.exports = router;
