var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var orderstatus = require("../common/orderstatus")
var mongoose = require("mongoose");
var Gym = mongoose.model("Gym");
var Interspace = mongoose.model("Interspace");
var Lock = mongoose.model("Lock");
var Officeorder = mongoose.model("Officeorder");
var Finance = mongoose.model("Finance");
var User = mongoose.model("User");

router.get("/",function(req,res){
    Gym.remove({},function(err,docs){
        res.send(docs)
    })
})

/*
 /添加健身房
 */
router.get("/addgym",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        Interspace.find({},function(err,docs){
            var leftNav = functions.createLeftNavByCodes('Yb', userinfo.arr);
            res.render("gymadmin/addgym_mng",{
                leftNav:leftNav,
                userinfo: userinfo.adminuserInfo,
                interspace:docs,
            })
        })

    }else {
        res.render('login')
    }
})

/**
 * 查询锁
 */
router.post("/searchlock",function(req,res){
    Lock.find({interspaceId:req.body.interspaceid,roomId:''},function(err,locks){
        if(err){
            res.status(200).json({
                status:0,
                data:null
            });
        }else{
            locks.unshift({
                mac:00,
                lockName:'请选择门锁'
            })
            res.status(200).json({
                status:1,
                data:locks
            });
        }
    })
})


/*
 /处理添加健身房
 */
router.post("/insertgym",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo){
        console.log(req.body)
        var gym = new Gym({
            interspaceId:req.body.interspaceid,       //空间id
            gymName:req.body.gymname,                  //健身房名字
            // startTime:req.body.startTime,                //开放时间
            // endTime:req.body.endTime,                 //结束时间
            lockMac:req.body.mac,
            roomInfo:req.body.data,
            price1:req.body.price1,                  //入驻企业有期权价格
            price2:req.body.price2,              //入驻企业无期权价格
            price3:req.body.price3,            //普通用户价格
            personNum:req.body.personnum,              //人数
            gymPic:req.body.gympic,                  //健身房图片
            address:req.body.address,                //地址
            createTime:Date.now(),            //创建时间

        })
        gym.save(function(err,docs){
            if(err){
                console.log(err)
                res.render("nodata")
            }else{
                Lock.update({mac:req.body.mac},{'roomId':docs._id,'roomName':req.body.gymname},function(err,locks){
                    if(err){
                        res.render('nodata')
                    }else{
                        res.redirect("/gymadmin/gymlist")
                    }
                })


            }
        })
    }else{
        res.render('login')
    }

})

/*
 查询所有健身房
 */
router.get("/gymlist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ya', userinfo.arr);
        var pagesize = 7;
        var counturl = "/gymadmin/getgym/1/"+pagesize + '/1';
        var dataurl = "/gymadmin/getgym/2"+ '/' + pagesize;
        res.render('gymadmin/gymlist_mng',{
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

router.get("/getgym/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {

        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Gym.count().exec(function(err,docs){
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
                Gym.find().skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        Interspace.find({},function(err,interspaces){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            }else{
                                var data = new Array()
                                for(var i=0;i<docs.length;i++){
                                    for(var j=0;j<interspaces.length;j++){
                                        if(docs[i].interspaceId == interspaces[j]._id){
                                            var obj = {
                                                interspacesName:interspaces[j].interspaceName
                                            }
                                            var newjson = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
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
/*
 /删除路演厅
 */
router.post("/delete",function (req,res) {
    Gym.remove({_id:req.body.gymid},function (err,docs) {
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/gymadmin/gymlist")
        }
    })
})
/*
 /编辑健身房
 */
router.get("/editgym/:gymid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ya', userinfo.arr);
        Interspace.find({},function (err,interspace) {
            if(err){
                res.render("nodata")
            }else {
                Gym.findOne({_id:req.params.gymid},function(err,gym){

                    var interspacename
                    for(var i = 0 ; i < interspace.length ; i++){
                        if(gym.interspaceId==interspace[i]._id){
                             interspacename = interspace[i].interspaceName
                        }
                    }
                    res.render('gymadmin/gyminfo_mng',{
                        data:gym,
                        interspace:interspace,
                        interspacename:interspacename,
                        leftNav:leftNav,
                        userinfo: userinfo.adminuserInfo
                    })
                })
            }
        })
    }else {
        res.render('login')
    }
})



router.post("/updategym",function (req,res) {
    var gym = {
        interspaceId:req.body.interspaceid,       //空间id
        gymName:req.body.gymname,                  //健身房名字
        roomInfo:req.body.data,
        price1:req.body.price1,                  //入驻企业有期权价格
        price2:req.body.price2,              //入驻企业无期权价格
        price3:req.body.price3,            //普通用户价格
        personNum:req.body.personnum,              //人数
        gymPic:req.body.gympic,                  //健身房图片
        address:req.body.address,                //地址
        createTime:Date.now(),            //创建时间
    }
    Gym.update({_id:req.body.boardid},gym,function(err,doce){
        if(err){
            res.render("nodata")
        }else{
            res.redirect('/gymadmin/gymlist');
        }
    })
})


/**
 * 健身房订单
 */
router.get("/gymorders",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        Gym.find({},function(err,gyms){
            if(err){
                res.render('nodata')
            }else{
                var leftNav = functions.createLeftNavByCodes('Yc', userinfo.arr);
                var pagesize = 7;
                var obj = {
                    type:4,
                    orderStatus:orderstatus.statusB10001
                }
                var gym={
                    _id:'0',
                    gymName:'--请选择健身房--'
                }
                var counturl = "/gymadmin/getgymorder/1/"+JSON.stringify(obj)+'/'+pagesize + '/1';
                var dataurl = "/gymadmin/getgymorder/2"+ '/' + JSON.stringify(obj)+'/'+pagesize;
                res.render('gymadmin/gymorder_mng',{
                    leftNav:leftNav,
                    pagesize : pagesize,
                    counturl:counturl,
                    dataurl:dataurl,
                    userinfo: userinfo.adminuserInfo,
                    gym:gym,
                    gyms:gyms

                });
            }

        })

    }else {
        res.render('login')
    }
})

/**
 * 筛选订单
 */
router.get("/searchgymorder/:type/:data",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        Gym.find({},function(err,gyms){
            if(err){
                res.render('nodata')
            }else{
                if(req.params.type == 1){
                    var obj = {
                        goodsId:req.params.data,
                        type:4,
                        orderStatus:orderstatus.statusB10001
                    }
                    if(req.params.data == 0){
                        var gym={
                            _id:'0',
                            gymName:'--请选择健身房--'
                        }
                    }else{
                        var gym={}
                        for(var i=0;i<gyms.length;i++){
                            if(req.params.data == gyms[i]._id){
                                gym._id = gyms[i]._id;
                                gym.gymName = gyms[i].gymName;
                            }
                        }
                    }
                }else{
                    var data = JSON.stringify(req.params.data)

                }

                var leftNav = functions.createLeftNavByCodes('Yc', userinfo.arr);
                var pagesize = 7;


                var counturl = "/gymadmin/getgymorder/1/"+JSON.stringify(obj)+'/'+pagesize + '/1';
                var dataurl = "/gymadmin/getgymorder/2"+ '/' + JSON.stringify(obj)+'/'+pagesize;
                res.render('gymadmin/gymorder_mng',{
                    leftNav:leftNav,
                    pagesize : pagesize,
                    counturl:counturl,
                    dataurl:dataurl,
                    userinfo: userinfo.adminuserInfo,
                    gym:gym,
                    gyms:gyms

                });
            }

        })

    }else {
        res.render('login')
    }
})

/**
 * 查询健身房订单
 */
router.get("/getgymorder/:type/:data/:pagesize/:page",function(req,res,next){
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
                Officeorder.find(JSON.parse(req.params.data)).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
                                                time:''
                                            }
                                            var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                            data.push(newjson)
                                        }
                                    }
                                }
                                for(var j=0;j<data.length;j++){

                                    var arr = functions.sortNumberByKey(data[j].orderInfo,'goodsId',-1)
                                    console.log(arr[0].goodsId)
                                    console.log(arr[arr.length-1].goodsId)
                                    var timeon = functions.gymTime(arr[0].goodsId)
                                    var timeend = functions.gymTime(arr[arr.length-1].goodsId)
                                    console.log(timeon)
                                    console.log(timeend)
                                    var starttime = parseInt(data[j].orderTime)+parseInt(timeon);
                                    var endtime = parseInt(data[j].orderTime) + parseInt(timeend) + 30*60*1000;
                                    data[j].time = functions.timeFormat(starttime) +' -- '+ functions.timeFormat(endtime)
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
 * 健身房财务
 */
router.get("/gymfinance",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {

        var leftNav = functions.createLeftNavByCodes('Yd', userinfo.arr);
        var pagesize = 7;
        var obj = {
            type:4,
        }
        var counturl = "/gymadmin/getgymfinance/1/"+JSON.stringify(obj)+'/'+pagesize + '/1';
        var dataurl = "/gymadmin/getgymfinance/2"+ '/' + JSON.stringify(obj)+'/'+pagesize;
        res.render('gymadmin/gymfinance_mng',{
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

router.get("/getgymfinance/:type/:data/:pagesize/:page",function(req,res,next){
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