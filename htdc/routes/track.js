var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var orderstatus = require("../common/orderstatus")
var mongoose = require("mongoose");
var Track = mongoose.model("Track");
var Officeorder = mongoose.model("Officeorder");
var User = mongoose.model("User");
var Finance = mongoose.model("Finance");
var Trackinterspace = mongoose.model("Trackinterspace");

/*
/添加赛道
 */
router.get("/addtrack",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pc', userinfo.arr);
        res.render("track/addtrack_mng",{
            leftNav:leftNav,
            userinfo: userinfo.adminuserInfo
        })
    }else {
        res.render('login')
    }
})

/*
/处理添加赛道
 */
router.post("/inserttrack",function(req,res){
    var ad = new Track(req.body);
    ad.save(function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/track/tracklist")
        }
    })
})

/*
 /查询所有赛道
 */
router.get("/tracklist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var pagesize=3
        var leftNav = functions.createLeftNavByCodes('Pc', userinfo.arr);
        var counturl = "/track/gettracks/1/"+pagesize + '/1';
        var dataurl = "/track/gettracks/2"+ '/' + pagesize;
        res.render('track/tracklist_mng',{
            leftNav:leftNav,
            pagesize : pagesize,
            counturl:counturl,
            dataurl:dataurl,
            userinfo: userinfo.adminuserInfo
        });
    }else {
        res.render('login')
    }
})

router.get("/gettracks/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Track.count().exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    res.status(200).json(docs);
                }
            })
            break;
        case '2':
            Track.find().skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    res.status(200).json(docs);
                }
            })
            break;

    }
})
/*
/删除赛道
 */
router.post("/delete",function (req,res) {
    Track.remove({_id:req.body.trackid},function (err,docs) {
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/track/tracklist")
        }
    })
})
/*
/编辑赛道
 */
router.get("/trackinfo/:trackid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pc', userinfo.arr);
        Track.find({_id:req.params.trackid},function (err,docs) {
            if(err){
                res.render("nodata")
            }else {
                res.render('track/trackinfo_mng',{
                    data:docs[0],
                    leftNav:leftNav,
                    userinfo: userinfo.adminuserInfo
                })
            }
        })

    }else {
        res.render('login')
    }

})

router.post("/update",function (req,res) {
    var obj = {
        name:req.body.name,
        picUrl1:req.body.picUrl1,       //静态
        picUrl2:req.body.picUrl2,
    }
    Track.update({_id:req.body.trackid},obj,function(err,doce){
        if(err){
            res.render("nodata")
        }else{
            res.redirect('/track/tracklist');
        }
    })
})

/**
 * AA加速订单
 */
router.get("/trackorder",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pf', userinfo.arr);
        var pagesize = 7;
        var counturl = "/track/trackorder/1/"+pagesize + '/1';
        var dataurl = "/track/trackorder/2"+ '/' + pagesize;
        res.render('track/trackorder_mng',{
            leftNav:leftNav,
            pagesize : pagesize,
            counturl:counturl,
            dataurl:dataurl,
            userinfo: userinfo.adminuserInfo
        });
    }else {
        res.render('login')
    }
})

router.get("/trackorder/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var obj = {
            type:'9',
            orderStatus:orderstatus.statusB10001
        }
        console.log(obj)
        switch(req.params.type){
            case '1':
                Officeorder.count(obj).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        res.status(200).json(docs);
                    }
                })
                break;
            case '2':
                Officeorder.find(obj).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        console.log(docs)
                        var userids = new Array()
                        for(var i=0;i<docs.length;i++){
                            userids.push(docs[i].userId)
                        }
                        User.find({_id:{$in:userids}},function(err,users){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            }else{
                                var data = new Array()
                                for(var x=0;x<docs.length;x++){
                                    for(var y=0;y<users.length;y++){
                                        if(docs[x].userId == users[y]._id){
                                            var obj = {
                                                userName:users[y].nickName,
                                                time:functions.timeFormat(docs[x].createTime)
                                            }
                                            var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                            data.push(newjson)
                                        }
                                    }
                                }
                                res.status(200).json(data);
                            }
                        })

                    }
                })
                break;

        }
    }else{
        res.render('login')
    }

})

/**
 * 根据消费码搜索订单
 */
router.get("/orderbycode/:name",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pf', userinfo.arr);
        var pagesize = 7;
        var goodsName=req.params.name
        var counturl = "/track/codeorder/1/"+goodsName+'/'+pagesize + '/1';
        var dataurl = "/track/codeorder/2/"+goodsName +'/'+ pagesize;
        res.render('track/trackorder_mng',{
            //administrator:userinfo,
            leftNav:leftNav,
            pagesize : pagesize,
            counturl:counturl,
            dataurl:dataurl,
            userinfo: userinfo.adminuserInfo
        });
    }else {
        res.render('login')
    }
})

router.get("/codeorder/:type/:goodsName/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var qs=new RegExp(req.params.goodsName);
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var obj = {
            '$or' :  [ {'consumerCode':qs} , {'userPhone':qs} ] ,
            type:'9',
            orderStatus:orderstatus.statusB10001
        }
        console.log(obj)
        switch(req.params.type){
            case '1':
                Officeorder.count(obj).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        res.status(200).json(docs);
                    }
                })
                break;
            case '2':
                Officeorder.find(obj).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{

                        var userids = new Array()
                        for(var i=0;i<docs.length;i++){
                            userids.push(docs[i].userId)
                        }
                        User.find({_id:{$in:userids}},function(err,users){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            }else{
                                var data = new Array()
                                for(var x=0;x<docs.length;x++){
                                    for(var y=0;y<users.length;y++){
                                        if(docs[x].userId == users[y]._id){
                                            var obj = {
                                                userName:users[y].nickName,
                                                time:functions.timeFormat(docs[x].createTime)
                                            }
                                            var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                            data.push(newjson)
                                        }
                                    }
                                }
                                res.status(200).json(data);
                            }
                        })

                    }
                })
                break;

        }
    }else{
        res.render('login')
    }
})

/**
 * 确认收货
 */
router.post("/orderfinish",function(req,res){
    Officeorder.update({_id:req.body.orderid},{'orderStatus':orderstatus.statusU10001},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect("/track/trackorder")
        }
    })
})

/**
 * AA加速财务查询
 */
router.get("/trackfinance",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var data = {
            type:9
        }
        var leftNav = functions.createLeftNavByCodes('Pg', userinfo.arr);
        var pagesize = 7;
        var counturl = "/track/trackfinance/1/"+JSON.stringify(data)+'/'+pagesize + '/1';
        var dataurl = "/track/trackfinance/2/"+JSON.stringify(data)+'/'+ pagesize;
        res.render('track/trackfinance_mng',{
            leftNav:leftNav,
            pagesize : pagesize,
            counturl:counturl,
            dataurl:dataurl,
            userinfo: userinfo.adminuserInfo
        });
    }else {
        res.render('login')
    }
})

router.get("/trackfinance/:type/:data/:pagesize/:page",function(req,res,next){
    console.log(JSON.parse(req.params.data))
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        // var obj = {
        //     type:5
        // }
        // if(JSON.parse(req.params.data).status == 1){
        //     var newjson = {
        //         type:5
        //     }
        // }else{
        //     var newjson = eval('('+(JSON.stringify(JSON.parse(req.params.data))+JSON.stringify(obj)).replace(/}{/,',')+')');
        // }
        var newjson = JSON.parse(req.params.data)
        console.log(newjson)
        switch(req.params.type){
            case '1':
                Finance.count(newjson).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        res.status(200).json(docs);
                    }
                })
                break;
            case '2':
                Finance.find(newjson).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{

                        var userids = new Array()
                        for(var i=0;i<docs.length;i++){
                            userids.push(docs[i].userId)
                        }
                        User.find({_id:{$in:userids}},function(err,users){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            }else{
                                var data = new Array()
                                for(var x=0;x<docs.length;x++){
                                    for(var y=0;y<users.length;y++){
                                        if(docs[x].userId == users[y]._id){
                                            var obj = {
                                                userName:users[y].nickName,
                                                time:functions.timeFormat(docs[x].createTime),
                                                money:(docs[x].amount/100).toFixed(2)
                                            }
                                            switch(docs[x].channel){
                                                case 'wx':
                                                    obj.paytype = '微信支付'
                                                    break;
                                                case 'alipay':
                                                    obj.paytype = '支付宝支付'
                                                    break;
                                                case 'wallet':
                                                    obj.paytype = '钱包支付'
                                                    break;

                                            }
                                            var json = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                            data.push(json)
                                        }
                                    }
                                }
                                res.status(200).json(data);
                            }
                        })

                    }
                })
                break;

        }
    }else{
        res.render('login')
    }

})

/**
 * 日期搜索
 */
router.get('/datesearch/:data',function(req,res){
    //{"starttime":"2017-06-08","enddate":"2017-06-21"}
    var json = JSON.parse(req.params.data)
    var starttime = json.starttime + ' 00:00:00';
    var startdate = Date.parse(new Date(starttime))
    var endtime = json.enddate + ' 00:00:00';
    var enddate = Date.parse(new Date(endtime))+24*60*60*1000
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var data = {
            type:9,
            createTime:{'$gt':startdate,'$lt':enddate}
        }
        var leftNav = functions.createLeftNavByCodes('Pg', userinfo.arr);
        var pagesize = 7;
        var counturl = "/track/trackfinance/1/"+JSON.stringify(data)+'/'+pagesize + '/1';
        var dataurl = "/track/trackfinance/2/"+JSON.stringify(data)+'/'+ pagesize;
        res.render('track/trackfinance_mng',{
            leftNav:leftNav,
            pagesize : pagesize,
            counturl:counturl,
            dataurl:dataurl,
            userinfo: userinfo.adminuserInfo
        });
    }else {
        res.render('login')
    }
})


/**
 * AA加速空间列表
 */
router.get("/trackinterspace",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ph', userinfo.arr);
        var pagesize = 7;
        var counturl = "/track/trackinterspace/1/"+pagesize + '/1';
        var dataurl = "/track/trackinterspace/2/"+ pagesize;
        res.render('track/trackinterspace_mng',{
            leftNav:leftNav,
            pagesize : pagesize,
            counturl:counturl,
            dataurl:dataurl,
            userinfo: userinfo.adminuserInfo
        });
    }else {
        res.render('login')
    }
})


router.get("/trackinterspace/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);

        switch(req.params.type){
            case '1':
                Trackinterspace.count({}).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        res.status(200).json(docs);
                    }
                })
                break;
            case '2':
                Trackinterspace.find({}).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var data = new Array()
                        for(var i=0;i<docs.length;i++){
                            var obj = {
                                time:functions.timeFormat(docs[i].createTime)
                            }
                            var newjson = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                            data.push(newjson)
                        }
                        res.status(200).json(data);

                    }
                })
                break;

        }
    }else{
        res.render('login')
    }

})

/**
 * 添加空间
 */
router.get("/addinterspace",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ph', userinfo.arr);
        res.render('track/addtrackinterspace_mng',{
            leftNav:leftNav,
            userinfo: userinfo.adminuserInfo
        });
    }else {
        res.render('login')
    }
})

/**
 * 处理添加空间
 */
router.post("/insertinterspace",function(req,res){
    var interspace = new Trackinterspace({
        name:req.body.name,           //活动标题
        imgUrl:req.body.imgUrl,        //图片
        adress:req.body.adress,        //详细地址
        data:req.body.data,        //详细地址
        createTime:Date.now(),    //发布时间
    })
    interspace.save(function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect("/track/trackinterspace")
        }
    })
})

/**
 * 编辑空间
 */
router.get("/editinterspace/:interspaceid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        Trackinterspace.find({_id:req.params.interspaceid},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                var leftNav = functions.createLeftNavByCodes('Ph', userinfo.arr);
                res.render('track/interspaceinfo_mng',{
                    content:docs[0],
                    leftNav:leftNav,
                    userinfo: userinfo.adminuserInfo
                });
            }
        })

    }else {
        res.render('login')
    }
})

/**
 * 处理编辑空间
 */
router.post("/updateinterspace",function(req,res){
   // interspaceid
    Trackinterspace.update({_id:req.body.interspaceid},req.body,function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect('/track/editinterspace/'+req.body.interspaceid)
        }
    })
})
module.exports = router;