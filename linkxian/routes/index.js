var express = require('express');
var router = express.Router();
var xlsx = require('node-xlsx');
var fs = require('fs');
var md5 = require('md5')
var formidable = require('formidable');
var request = require('request')
var config = require('../common/config');
var functions = require('../common/functions');
var errors = require('../common/errors');

router.get("/fdsy",function(req,res){
    var time = new Date(new Date().toLocaleDateString()).getTime();
    var tm = parseInt(time/1000)
    console.log(tm)
    //start_time:{$gte:tm},end_time:{$lte:tm}
    req.models.Benefit.find({}, function (err, docs) {
        if(err){
            res.send(err)
        }else{
            res.send(docs)
        }


    })
    // req.models.Benefit.find({ id:23 }).each(function (person) {
    //     person.status = 1;
    // }).save(function (err,docs) {
    //     res.send(docs)
    // })
})

router.get('/displace', function (req, res, next) {
    res.render('displace');
});
router.get('/nearby', function (req, res, next) {
    res.render('nearby');
});

router.get('/', function (req, res, next) {
    res.render('index');
});

/* 异业营销置换表单提交 */
router.post('/add_marketing_exchange', function(req, res, next) {
    var url = 'https://api.map.baidu.com/geocoder/v2/?address='+encodeURIComponent(req.body.address)+'&output=json&ak='+config.baidu.key
    console.log(req.body)
    request(url,function (err,resphones,body) {
        var data = JSON.parse(body)
        if(data.status == 0){
            var latitude = data.result.location.lat
            var longitude = data.result.location.lng
        }else{
            var latitude = '34.202392'
            var longitude = '108.963492'
        }
        req.models.Marketing.create({
            type:req.body.type,                                //品类
            shopname:req.body.shopname,                            //店名
            address:req.body.address,                             //地址
            latitude:latitude,                          //纬度
            longitude:longitude,                         //经度
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
    })
});

/* 附近优惠表单提交 */
router.post('/add_benefit', function(req, res, next) {
    console.log(req.body)
    var url = 'https://api.map.baidu.com/geocoder/v2/?address='+encodeURIComponent(req.body.address)+'&output=json&ak='+config.baidu.key

    request(url,function (err,resphones,body) {
        var data = JSON.parse(body)
        if (data.status == 0) {
            var latitude = data.result.location.lat;
            var longitude = data.result.location.lng;
        } else {
            var latitude = '34.202392';
            var longitude = '108.963492';
        }
        // var ontm = Date.parse((req.body.start_time).replace(/\//g,'-'))
        // console.log(ontm)
        req.models.Benefit.create({
            type:req.body.type,                                //品类
            shopname:req.body.shopname,                            //店名
            address:req.body.address,                             //地址
            latitude:latitude,                          //纬度
            longitude:longitude,                         //经度
            phone:req.body.phone,                               //电话
            benefit:req.body.benefit,                  //优惠内容
            picurl:req.body.picurl,                              //图片
            start_time:req.body.start_time,                       //开始时间
            end_time:parseInt(req.body.end_time)/1000,                         //结束时间
            shop_sign_picurl:req.body.shop_sign_picurl,              //店铺门头照片
            show_link_url:req.body.show_link_url,                //店铺展示页链接
            link_type:parseInt(req.body.link_type),                //店铺展示页链接类型
            status:0,                           //状态。0未审批；1审批通过
            create_time:parseInt(Date.now()/1000)                      //创建时间
        }, function (err, docs) {
            if(err){
                console.log(err)
                res.status(200).json(errors.error3);
            }else{
                res.status(200).json({
                    error:0,
                    message:'success',
                    data:docs
                });
            }
        })
    })
});


router.get("/nearby_favourable/:lat/:lng",function(req,res){
    //34.220546   108.953364
    req.models.Bannerads.find({}, function (err, banner) {
        if(err){
            res.send(err)
        }else{
            var time = new Date(new Date().toLocaleDateString()).getTime();
            var tm = parseInt(time/1000)
            console.log(time+'************************88'+tm)
           //start_time:{$gte:tm},end_time:{$lte:tm}
            req.models.Benefit.find({status:1}, function (err, docs) {
                if(err){
                    console.log(err)
                }else{
                    var data = []
                    for(var i=0;i<docs.length;i++){
                        console.log('ks'+docs[i].start_time)
                        console.log('js'+docs[i].end_time)
                        if((docs[i].start_time <= tm) && (docs[i].end_time >= tm)){
                            var obj = {
                                distance:0
                            }
                            var json = eval('(' + (JSON.stringify(docs[i]) + JSON.stringify(obj)).replace(/}{/, ',') + ')');
                            data.push(json)
                        }

                    }
                    var lat1 = req.params.lat;
                    var lng1 = req.params.lng;
                    for(var x=0;x<data.length;x++){
                        var lat2 = data[x].latitude
                        var lng2 = data[x].longitude
                        data[x].distance = functions.getFlatternDistance(lat1, lng1, lat2, lng2)
                    }

                    var arr = functions.sortByKey(data,'distance',2)
                    var newarr = arr.slice(0,17)

                    for(var j=0;j<newarr.length;j++){
                        newarr[j].show_link_url = "/tiaozhuan?url="+encodeURIComponent(newarr[j].show_link_url)
                    }
                    var data1={
                        banner:banner,
                        shop:newarr
                    }
                    console.log(data1)
                   res.render("myNear",data1)
                }
            })

        }

    });
})
router.get("/nearby_favourable",function(req,res){
    //34.220546   108.953364
    req.models.Bannerads.find({}, function (err, banner) {
        if(err){
            res.send(err)
        }else{
            var time = new Date(new Date().toLocaleDateString()).getTime();
            var tm = parseInt(time/1000)
           //start_time:{$gte:tm},end_time:{$lte:tm}
            req.models.Benefit.find({status:1}, function (err, docs) {
                if(err){
                    console.log(err)
                }else{
                    var data = []
                    for(var i=0;i<docs.length;i++){
                        console.log('ks'+docs[i].start_time)
                        console.log('js'+docs[i].end_time)
                        if((docs[i].start_time <= tm) && (docs[i].end_time >= tm)){
                            var obj = {
                                distance:0
                            }
                            var json = eval('(' + (JSON.stringify(docs[i]) + JSON.stringify(obj)).replace(/}{/, ',') + ')');
                            data.push(json)
                        }

                    }
                    var lat1 = '34.220546';
                    var lng1 = '108.953364';
                    for(var x=0;x<data.length;x++){
                        var lat2 = data[x].latitude
                        var lng2 = data[x].longitude
                        data[x].distance = functions.getFlatternDistance(lat1, lng1, lat2, lng2)
                    }

                    var arr = functions.sortByKey(data,'distance',2)
                    var newarr = arr.slice(0,17)

                    for(var j=0;j<newarr.length;j++){
                        newarr[j].show_link_url = "/tiaozhuan?url="+encodeURIComponent(newarr[j].show_link_url)
                    }
                    var data1={
                        banner:banner,
                        shop:newarr
                    }
                    console.log(data1)
                   res.render("myNear",data1)
                }
            })

        }

    });
})
/**
 * 上传图片
 */
router.post("/uploadimg",function(req,res) {
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    //var form = new multiparty.Form()
    var form = new formidable.IncomingForm();                   //创建上传表单
    form.encoding = 'utf-8';		                            //设置编辑
    //form.uploadDir = config.rootDir + '/uploads/';	            //设置上传目录
    form.uploadDir = config.rootDir + '/public/images';	            //设置上传目录
    form.keepExtensions = true;	                                //保留后缀
    form.multiples = false;
    form.maxFieldsSize = 2 * 1024 * 1024;                        //文件大小
    var files = [], fields = [], docs = [];

    form.parse(req, function(err, fields, files) {
        //res.writeHead(200, {'content-type': 'text/plain'}); res.write('received upload:\n\n'); res.end(sys.inspect({fields: fields, files: files}));
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
                ret1.data = filename.substr(config.rootDir.length+'/public'.length);
                console.log(ret1);
                res.status(200).json(ret1);
            });

        }
    })
   /*     .on('aborted', function() {
        console.log("ttttttttttt")
    }).on('end', function() {
        console.log("585555555")
    });*/
})

router.post("/uploadtest",function(req,res){
    var tmp_path = req.files.thumbnail.path;
    console.log(tmp_path)
    // 指定文件上传后的目录 - 示例为"images"目录。
    var target_path = './uploads/' + req.files.thumbnail.name;
    // 移动文件
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // 删除临时文件夹文件,
        fs.unlink(tmp_path, function () {
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
        });
    })
})

/**
 * 搜索优惠
 */
router.post("/favourable_search",function(req,res){
    console.log(req.body.content)
    var qs=new RegExp(req.body.content);
    var time = new Date(new Date().toLocaleDateString()).getTime();
    var tm = parseInt(time/1000)
    req.models.Benefit.find({status:1},function(err,docs){
        if(err){
            res.status(200).json(errors.error3);
        }else{
            var data = []
            for(var i=0;i<docs.length;i++){
                if((docs[i].start_time <= tm) && (docs[i].end_time >= tm)) {
                    if ((docs[i].shopname.match(qs)) || (docs[i].benefit.match(qs)) || (docs[i].address.match(qs))) {
                        data.push(docs[i])
                    }
                }
            }
            req.models.Bannerads.find({}, function (err, banner) {
                if (err) {
                    res.send(err)
                } else {
                    var newarr = data.slice(0,17);

                    var data1={
                        banner:banner,
                        shop:newarr
                    }
                    res.render("myNear",data1)
                }
            })

        }
    })
})

/**
 * 根据类型搜索优惠
 */
router.get("/favourable_typesearch/:data",function(req,res){
    var time = new Date(new Date().toLocaleDateString()).getTime();
    var tm = parseInt(time/1000)


    if(req.params.data=='全部'){
        var obj={
            status:1
        }
    }else{
        if(req.params.data.indexOf('_')!=-1){
            var data=req.params.data.replace('_', "/")
            var obj={
                type:data,
                status:1
            }
        }else {
            var obj={
                type:req.params.data,
                status:1
            }
        }

    }
    console.log(obj)

    req.models.Benefit.find(obj,function(err,docs){
        if(err){
            res.status(200).json(errors.error3);
        }else{
            req.models.Bannerads.find({}, function (err, banner) {
                if (err) {
                    res.send(err)
                } else {
                    var data = []
                    for(var i=0;i<docs.length;i++){
                        if((docs[i].start_time <= tm) && (docs[i].end_time >= tm)) {
                            data.push(docs[i])
                        }
                    }
                    var newarr = data.slice(0,17)
                    var data1={
                        banner:banner,
                        shop:newarr
                    }
                    res.render("myNear",data1)
                }
            })

        }
    })
});

router.get("/tiaozhuan",function (req,res,next) {
    var url = encodeURI(req.query.url);
    res.redirect(url);
})
module.exports = router;
