var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var orderstatus = require("../common/orderstatus")
var mongoose = require("mongoose");
var Roadshow = mongoose.model("Roadshow");
var Lock = mongoose.model("Lock");
var Officeorder = mongoose.model("Officeorder");
var User = mongoose.model("User");
var Finance = mongoose.model("Finance");

router.get("/esfg",function(req,res){
    Officeorder.find({},function(err,docs){
        res.send(docs)
    })
})

/*
 /添加路演厅
 */
router.get("/addroadshow",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Rb', userinfo.arr);
        var interspacesid = userinfo.adminuserInfo.interspaceId
        Lock.find({interspaceId:interspacesid,roomId:''},function(err,locks) {
            if (err) {
                res.render('nodata')
            } else {
                res.render("roadshowadmin/addroadshow_mng",{
                    leftNav:leftNav,
                    userinfo: userinfo.adminuserInfo,
                    locks:locks
                })
            }
        })

    }else {
        res.render('login')
    }
})

/*
 /处理添加路演厅
 */
router.post("/insertroadshow",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo){
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var roadshow = new Roadshow({
            interspaceId:interspaceid,       //空间id
            lockMac:req.body.mac,
            name:req.body.name,              //路演厅名称
            area:req.body.area,              //路演厅面积
            personNum:req.body.personNum*1,  //容纳人数
            price1:req.body.price1*1,        //入驻企业有期权价格
            price2:req.body.price2*1,        //入驻企业无期权价格
            price3:req.body.price3*1,        //普通用户价格
            picUrl:req.body.picUrl,
            deposit:req.body.deposit,
            unit:req.body.unit,              //价格单位
            status:1,                        //路演厅状态1正常2维修中
            orderInfo:[],                    //预定情况
            address:req.body.address,       //详细地址
            createTime:Date.now(),           //时间
        })
        roadshow.save(function(err,docs){
            if(err){
                console.log(err)
                res.render("nodata")
            }else{
                Lock.update({mac:req.body.mac},{'roomId':docs._id,'roomName':req.body.name},function(err,locks){
                    if(err){
                        res.render('nodata')
                    }else{
                        res.redirect("/roadshowadmin/roadshowlist")
                    }
                })
            }
        })
    }else{
        res.render('login')
    }

})

/*
 查询所有路演厅
 */
router.get("/roadshowlist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ra', userinfo.arr);
        var pagesize = 7;
        var counturl = "/roadshowadmin/getroadshow/1/"+pagesize + '/1';
        var dataurl = "/roadshowadmin/getroadshow/2"+ '/' + pagesize;
        res.render('roadshowadmin/roadshowlist_mng',{
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

router.get("/getroadshow/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Roadshow.count({interspaceId:interspaceid}).exec(function(err,docs){
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
                Roadshow.find({interspaceId:interspaceid}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
 /删除路演厅
 */
router.post("/delete",function (req,res) {
    Roadshow.remove({_id:req.body.interspaceId},function (err,docs) {
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/roadshowadmin/roadshowlist")
        }
    })
})
/*
 /编辑路演厅
 */
router.get("/editroadshow/:interspaceId",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ra', userinfo.arr);
        Roadshow.findOne({_id:req.params.interspaceId},function (err,docs) {
            if(err){
                res.render("nodata")
            }else {
                res.render('roadshowadmin/roadshowinfo_mng',{
                    data:docs,
                    leftNav:leftNav,
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    }else {
        res.render('login')
    }
})



router.post("/updateroadshow",function (req,res) {
    var roadshow = {
        name:req.body.name,   //路演厅名称
        area:req.body.area,   //路演厅面积
        personNum:req.body.personNum*1,  //容纳人数
        price1:req.body.price1*1,                  //入驻企业有期权价格
        price2:req.body.price2*1,              //入驻企业无期权价格
        price3:req.body.price3*1,            //普通用户价格
        picUrl:req.body.picUrl,
        address:req.body.address,
        unit:req.body.unit,              //价格单位
    }
    Roadshow.update({_id:req.body.boardid},roadshow,function(err,doce){
        if(err){
            res.render("nodata")
        }else{
            res.redirect('/roadshowadmin/roadshowlist');
        }
    })
})

router.get("/editinfo/:interspaceId",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ra', userinfo.arr);
        Roadshow.findOne({_id:req.params.interspaceId},'roomInfo',function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.render('roadshowadmin/roadshowinfocontent_mng',{
                    leftNav:leftNav,
                    content:docs.roomInfo,
                    data:docs,
                    userinfo: userinfo.adminuserInfo
                });
            }
        })
    }else {
        res.render('login')
    }
})

router.post("/updateroadshowinfo",function(req,res){
    Roadshow.update({_id:req.body.interspaceId},{'roomInfo':req.body.roomInfo},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect("/roadshowadmin/editinfo/"+req.body.interspaceId)
        }
    })
})

/**
 * 路演厅订单
 */
router.get("/roadshoworder",function(req,res){
    //Officeorder
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Rc', userinfo.arr);
        var pagesize = 7;
        var counturl = "/roadshowadmin/getroadshoworder/1/"+pagesize + '/1';
        var dataurl = "/roadshowadmin/getroadshoworder/2"+ '/' + pagesize;
        res.render('roadshowadmin/roadshoworder_mng',{
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


router.get("/getroadshoworder/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Officeorder.count({interspaceId:interspaceid,type:3,orderStatus:orderstatus.statusB10001}).exec(function(err,docs){
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
                Officeorder.find({interspaceId:interspaceid,type:3}).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
                                                depositstatus:'',
                                                time:''
                                            }
                                            var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                            data.push(newjson)
                                        }
                                    }
                                }
                                for(var j=0;j<data.length;j++){
                                    if(data[j].isreturn == '1'){
                                        data[j].depositstatus = '已退押金'
                                    }else{
                                        data[j].depositstatus = '退还押金'
                                    }
                                    var arr = functions.sortNumberByKey(data[j].orderInfo,'goodsId',-1)
                                    var timeon = functions.roadshowTime(arr[0].goodsId)
                                    var timeend = functions.roadshowTime(arr[arr.length-1].goodsId)
                                    var starttime = parseInt(data[j].orderTime)+timeon;
                                    var endtime = parseInt(data[j].orderTime) + timeend + 30*60*1000;
                                    data[j].time = functions.timeFormat(starttime) +' -- '+ functions.timeFormat(endtime)
                                }
                                var result = []
                                for(var m=0;m<data.length;m++){
                                    switch(data[m].orderStatus){
                                        case 'M10001':
                                            var json = {
                                                status:'订单已使用',
                                                statusinfo:'订单已使用',
                                                statusCode:0

                                            }
                                            break;
                                        case 'M10002':
                                            var json = {
                                                status:'订单未使用',
                                                statusinfo:'订单未使用',
                                                statusCode:0
                                            }
                                            break;
                                        case '0':
                                            var json = {
                                                status:'订单未付款',
                                                statusinfo:'订单未付款',
                                                statusCode:0
                                            }
                                            break;
                                        default:
                                            var json = {
                                                statusinfo:'未处理',
                                                statusCode:1
                                            }
                                            break;

                                    }
                                    var jsonstr = eval('('+(JSON.stringify(data[m])+JSON.stringify(json)).replace(/}{/,',')+')');
                                    result.push(jsonstr)
                                }
                                res.status(200).json(result);
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
 * 退还押金
 */
router.post("/deposit",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        if(req.body.depositstatus == '1'){
            res.redirect("/roadshowadmin/roadshoworder")
        }else{
            var fee = req.body.deposit * 100
            //用户金额增加
            User.update({_id:req.body.userid},{'$inc':{'money':fee}},function(err,docs){
                if(err){
                    res.render('nodata')
                }else{
                    //改变订单状态
                    Officeorder.update({_id:req.body.orderid},{'isreturn':'1'},function(err,data){
                        if(err){
                            res.render('nodata')
                        }else{
                            //添加财务
                            var obj = new Finance({
                                userId:req.body.userid,         //userid
                                interspaceId:interspaceid,    //空间id
                                type:200,           //100充值101提现
                                amount:fee,        //金额(分)
                                goodsName:req.body.goodsname,
                                createTime:Date.now(),             //时间
                            })
                            obj.save(function(err,docs){
                                if(err){
                                    res.render('nodata')
                                }else{
                                    res.redirect("/roadshowadmin/roadshoworder")
                                }
                            })

                        }
                    })

                }
            })
        }
    }else{
        res.render('login')
    }
    // {
    //     userid: '591fe1eb4ccbd66f3e96cd6e',
    //     goodsname: 'L01',
    //     depositstatus: '0',
    //     deposit: '10',
    //     orderid: '5933c9964731b86615cba1c6' }
    //{ depositstatus: '0', orderid: '5932a1a947af07155d4d19d7' }


})

/**
 * 关闭订单
 */
router.post("/endorder",function(req,res){

})

module.exports = router;