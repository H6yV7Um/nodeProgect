var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var orderstatus = require("../common/orderstatus")
var errors = require("../common/errors")
var mongoose = require("mongoose");
var Boardroom = mongoose.model("Boardroom");
var Lock = mongoose.model("Lock");
var Officeorder = mongoose.model("Officeorder");
var User = mongoose.model("User");

router.get('/vvv',function (req,res) {

    var userinfo = req.session.adminuser;
    var interspaceid = userinfo.adminuserInfo.interspaceId
    Officeorder.find({/*interspaceId:interspaceid,type:2,*//*orderNo:'H15252244716400'*/}).sort({'createTime':-1}).exec(function(err,docs){
        res.send(docs)
    })
})

/*
 添加会议室
 */
router.get("/addboardroom",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('Qb', userinfo.arr);
        Lock.find({interspaceId:interspacesid,roomId:''},function(err,locks){
            if(err){
                res.render('nodata')
            }else{
                res.render("boardadmin/addboardroom_mng",{
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
 处理添加会议室
 */
router.post("/insertboardroom",function(req,res){
    var userinfo = req.session.adminuser;
    var interspaceid = userinfo.adminuserInfo.interspaceId
    var boardroom = new Boardroom({
        interspaceId:interspaceid,  //空间id
        lockMac:req.body.mac,
        name:req.body.name,   //会议室名称
        area:req.body.area,   //会议室面积
        address:req.body.address,
        personNum:req.body.personNum*1,  //容纳人数
        price1:req.body.price1*1,                  //入驻企业有期权价格
        price2:req.body.price2*1,              //入驻企业无期权价格
        price3:req.body.price3*1,            //普通用户价格
        picUrl:req.body.picUrl,
        unit:req.body.unit,              //价格单位
        status:1,           //办公室状态1正常2维修中
        orderInfo:[],        //预定情况
        roomInfo:'',
        createTime:Date.now(),             //时间
    })
    boardroom.save(function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            Lock.update({mac:req.body.mac},{'roomId':docs._id,'roomName':req.body.name},function(err,locks){
                if(err){
                    res.render('nodata')
                }else{
                    res.redirect("/boardadmin/boardroomlist")
                }
            })

        }
    })

})

/*
 查询所有会议室
 */
router.get("/boardroomlist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('Qa', userinfo.arr);
        var pagesize = 10;
        var counturl = "/boardadmin/getboardroom/1/"+pagesize + '/1';
        var dataurl = "/boardadmin/getboardroom/2"+ '/' + pagesize;
        res.render('boardadmin/boardlist_mng',{
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

router.get("/getboardroom/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Boardroom.count({interspaceId:interspaceid}).exec(function(err,docs){
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
                Boardroom.find({interspaceId:interspaceid}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
 /删除会议室
 */
router.post("/delete",function (req,res) {
    Boardroom.remove({_id:req.body.boardroomid},function (err,docs) {
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/boardadmin/boardroomlist")
        }
    })
})
/*
 /编辑会议室
 */
router.get("/editboardroom/:boardroomid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Qa', userinfo.arr);
        Boardroom.findOne({_id:req.params.boardroomid},function (err,docs) {
            if(err){
                res.render("nodata")
            }else {
                res.render('boardadmin/boardroominfo_mng',{
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

/**
 * 处理编辑
 */
router.post("/updateboardroom",function (req,res) {
    var boardroom = {
        name:req.body.name,   //会议室名称
        area:req.body.area,   //会议室面积
        address:req.body.address,
        personNum:req.body.personNum*1,  //容纳人数
        price1:req.body.price1*1,                  //入驻企业有期权价格
        price2:req.body.price2*1,              //入驻企业无期权价格
        price3:req.body.price3*1,            //普通用户价格
        picUrl:req.body.picUrl,
        unit:req.body.unit,              //价格单位
        picUrl:req.body.picUrl
    }
    Boardroom.update({_id:req.body.boardid},boardroom,function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect('/boardadmin/boardroomlist')
        }
    })
})

router.get("/editinfo/:boardid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Qa', userinfo.arr);
        Boardroom.findOne({_id:req.params.boardid},'roomInfo',function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.render('boardadmin/boardinfocontent_mng',{
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

router.post("/updateboardinfo",function(req,res){
    Boardroom.update({_id:req.body.boardid},{'roomInfo':req.body.roomInfo},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect("/boardadmin/editinfo/"+req.body.boardid)
        }
    })
})

/**
 * 查看一个锁是否被选定
 */
router.post("/checklock",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('Qb', userinfo.arr);
        Lock.find({interspaceId: interspacesid,mac:req.body.mac}, function (err, locks) {
            if(err){
                res.status(200).json(errors.error3);
            }else{
                if(locks[0].roomId == ''){
                    res.status(200).json(errors.error0);
                }else{
                    res.status(200).json(errors.error10015);
                }
            }
        })
    }else{
        res.render('login')
    }
})

/**
 * 会议室订单
 */
router.get("/boardroomorder",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('Qc', userinfo.arr);
        var pagesize = 10;
        var counturl = "/boardadmin/boardroomorder/1/"+pagesize + '/1';
        var dataurl = "/boardadmin/boardroomorder/2"+ '/' + pagesize;
        res.render('boardadmin/boardorder_mng',{
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

router.get("/boardroomorder/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Officeorder.count({interspaceId:interspaceid,type:2,orderStatus:orderstatus.statusB10001}).exec(function(err,docs){
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
                Officeorder.find({interspaceId:interspaceid,type:2}).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
                                                time:''
                                            }
                                            var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                            data.push(newjson)
                                        }
                                    }
                                }
                                for(var j=0;j<data.length;j++){
                                    var arr = functions.sortNumberByKey(data[j].orderInfo,'goodsId',-1)
                                    console.log(arr)
                                    var timeon = functions.officeTime(arr[0].goodsId)
                                    var timeend = functions.officeTime(arr[arr.length-1].goodsId)
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
                                //res.status(200).json(data);
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

router.post("/orderstatus",function(req,res){
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%5")
    Officeorder.update({_id:req.body.orderid},{orderStatus:orderstatus.statusM10001},function(err,docs){
        if(err){
            res.status(200).json({status:0})
        }else{
            console.log(docs)
            res.status(200).json({status:1})
        }
    })
})
module.exports = router;