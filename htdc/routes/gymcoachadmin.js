var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var orderstatus = require("../common/orderstatus")
var mongoose = require("mongoose");
var Gymcoach = mongoose.model("Gymcoach");
var Officeorder = mongoose.model("Officeorder");
var Finance = mongoose.model("Finance");
var User = mongoose.model("User");


router.get("/",function(req,res){
    Gymcoach.find({},function(err,docs){
        res.send(docs)
    })
})

/*
 /添加健身教练
 */
router.get("/addgymcoach",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Xb', userinfo.arr);
            res.render("gymcoachadmin/addgymcoach_mng",{
                leftNav:leftNav,
                userinfo: userinfo.adminuserInfo,

            })
    }else {
        res.render('login')
    }
})

/*
 /处理添加健身教练
 */
router.post("/insertgymcoach",function(req,res){
    console.log(req.body)
    var userinfo = req.session.adminuser;
    if(userinfo){

        var gymcoach = new Gymcoach({

            gymcoachName:req.body.gymcoachname,                  //教练名字
            // startTime:req.body.startTime,                //开放时间
            // endTime:req.body.endTime,                 //结束时间
            greatTerritory:req.body.greatTerritory,
            startTime:req.body.startTime,               //工作开始时间
            endTime:req.body.endTime,                 //工作结束时间
            gymcoachPhone:req.body.gymcoachPhone,
            price1:req.body.price1,                  //入驻企业有期权价格
            price2:req.body.price2,              //入驻企业无期权价格
            price3:req.body.price3,            //普通用户价格
            gymcoachPic:req.body.gymcoachpic,                  //教练图片
            createTime:Date.now(),            //创建时间


        })
        gymcoach.save(function(err,docs){
            if(err){
                console.log(err)
                res.render("nodata")
            }else{
                res.redirect("/gymcoachadmin/gymcoachlist")

            }
        })
    }else{
        res.render('login')
    }

})

/*
 查询所有健身教练
 */
router.get("/gymcoachlist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Xa', userinfo.arr);
        var pagesize = 7;
        var counturl = "/gymcoachadmin/getgymcoach/1/"+pagesize + '/1';
        var dataurl = "/gymcoachadmin/getgymcoach/2"+ '/' + pagesize;
        res.render('gymcoachadmin/gymcoachlist_mng',{
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

router.get("/getgymcoach/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {

        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Gymcoach.count().exec(function(err,docs){
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
                Gymcoach.find().skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
    }else{
        res.render('login')
    }

})

/**
 * 搜索教练
 */
router.post("/searchcoch",function(req,res){
    console.log(req.body)
    // { name: 'aa' }
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Xa', userinfo.arr);
        var pagesize = 7;
        var counturl = "/gymcoachadmin/getgymcoach/1/"+req.body.name+'/'+pagesize + '/1';
        var dataurl = "/gymcoachadmin/getgymcoach/2"+ '/'+req.body.name+'/' + pagesize;
        res.render('gymcoachadmin/gymcoachlist_mng',{
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

router.get("/getgymcoach/:type/:name/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var qs=new RegExp(req.params.name);
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Gymcoach.count({gymcoachName:qs}).exec(function(err,docs){
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
                Gymcoach.find({gymcoachName:qs}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
    }else{
        res.render('login')
    }

})


/*
 /删除教练
 */
router.post("/delete",function (req,res) {
    Gymcoach.remove({_id:req.body.gymcoachid},function (err,docs) {
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/gymcoachadmin/gymcoachlist")
        }
    })
})
/*
 /编辑教练
 */
router.get("/editgymcoach/:gymcoachid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Xa', userinfo.arr);
                Gymcoach.findOne({_id:req.params.gymcoachid},function(err,gym){
                    res.render('gymcoachadmin/gymcoachinfo_mng',{
                        data:gym,
                        leftNav:leftNav,
                        userinfo: userinfo.adminuserInfo
                    })
                })

    }else {
        res.render('login')
    }
})



router.post("/updategymcoach",function (req,res) {
    var gymcoach = {
        gymcoachName:req.body.gymcoachName,                  //教练名字
        // startTime:req.body.startTime,                //开放时间
        // endTime:req.body.endTime,                 //结束时间
        greatTerritory:req.body.greatTerritory,
        startTime:req.body.startTime,               //工作开始时间
        endTime:req.body.endTime,                 //工作结束时间
        price1:req.body.price1,                  //入驻企业有期权价格
        price2:req.body.price2,              //入驻企业无期权价格
        price3:req.body.price3,            //普通用户价格
        gymcoachPic:req.body.gymcoachPic,                  //教练图片
        createTime:Date.now(),            //创建时间
    }
    Gymcoach.update({_id:req.body.boardid},gymcoach,function(err,doce){
        if(err){
            res.render("nodata")
        }else{
            res.redirect('/gymcoachadmin/gymcoachlist');
        }
    })
})

/**
 * 健身教练订单
 */
router.get("/gymcoachorders",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Xc', userinfo.arr);
        var pagesize = 7;
        var obj = {
            type:6,
            orderStatus:orderstatus.statusB10001
        }
        var counturl = "/gymcoachadmin/getgymcoachorder/1/"+JSON.stringify(obj)+'/'+pagesize + '/1';
        var dataurl = "/gymcoachadmin/getgymcoachorder/2"+ '/' + JSON.stringify(obj)+'/'+pagesize;
        res.render('gymcoachadmin/gymcoachorder_mng',{
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
 * 查询健身教练订单
 */
router.get("/getgymcoachorder/:type/:data/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {

        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Officeorder.count(JSON.parse(req.params.data)).exec(function(err,docs){
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
                Officeorder.find(JSON.parse(req.params.data)).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
                                console.log(docs[0].orderInfo)
                                var data = new Array()
                                for(var x=0;x<docs.length;x++){
                                    for(var y=0;y<users.length;y++){
                                        if(docs[x].userId == users[y]._id){
                                            var obj = {
                                                userName:users[y].nickName,
                                                time:''
                                            }
                                            var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                            data.push(newjson)
                                        }
                                    }
                                }
                                for(var j=0;j<data.length;j++){

                                    var starttime = functions.timeFormat(parseInt(data[j].orderInfo[0].startTime));
                                    var endtime = functions.timeFormat(parseInt(data[j].orderInfo[0].endTime));
                                    data[j].time = starttime +' -- '+ endtime
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
 * 健身教练财务
 */
router.get("/gymcoachfinance",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Xd', userinfo.arr);
        var pagesize = 7;
        var obj = {
            type:6,
        }
        var counturl = "/gymcoachadmin/getgymcoachfinance/1/"+JSON.stringify(obj)+'/'+pagesize + '/1';
        var dataurl = "/gymcoachadmin/getgymcoachfinance/2"+ '/' + JSON.stringify(obj)+'/'+pagesize;
        res.render('gymcoachadmin/gymcoachfinance_mng',{
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

router.get("/getgymcoachfinance/:type/:data/:pagesize/:page",function(req,res,next){
    console.log(JSON.parse(req.params.data))
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
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
                                console.log(data)
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



module.exports = router;