var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var orderstatus = require("../common/orderstatus");
var date = require("../common/date");
var mongoose = require("mongoose");
var Office = mongoose.model("Office");
var Station = mongoose.model("Station");
var Enterprise = mongoose.model("Enterprise");
var User = mongoose.model("User");
var Officeorder = mongoose.model("Officeorder");
var Lockauthority = mongoose.model("Lockauthority");
var Lock = mongoose.model("Lock");

router.get("/test",function(req,res){
    Officeorder.remove({},function(err,docs){
        res.send(docs)
    })
})

/*
添加办公室
 */
router.get("/addoffice",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Mb', userinfo.arr);
        var interspacesid = userinfo.adminuserInfo.interspaceId
        Lock.find({interspaceId:interspacesid,roomId:''},function(err,locks) {
            if (err) {
                res.render('nodata')
            } else {
                res.render("office/addoffice_mng",{
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
 /处理添加办公室
 */
router.post("/insertoffice",function(req,res){
    var userinfo = req.session.adminuser;
    var interspaceId=userinfo.adminuserInfo.interspaceId
    var obj = {
        interspaceId:interspaceId,
        lockMac:req.body.mac
    }
    var newjson = eval('('+(JSON.stringify(req.body)+JSON.stringify(obj)).replace(/}{/,',')+')');
    var ad = new Office(newjson);
    ad.save(function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            Lock.update({mac:req.body.mac},{'roomId':docs._id,'roomName':req.body.name},function(err,locks){
                if(err){
                    res.render('nodata')
                }else{
                    res.redirect("/officeadmin/officelist")
                }
            })

        }
    })
})

/*
 /查询所有办公室
 */
router.get("/officelist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ma', userinfo.arr);
        var pagesize = 6;
        var counturl = "/officeadmin/getoffices/1/"+pagesize + '/1';
        var dataurl = "/officeadmin/getoffices/2"+ '/' + pagesize;
        res.render('office/officelist_mng',{
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

router.get("/getoffices/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Office.count({interspaceId:interspaceid}).exec(function(err,docs){
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
                Office.find({interspaceId:interspaceid}).sort({name:1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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

    }

})
/*
 /删除办公室
 */
router.post("/delete",function (req,res) {
    Office.remove({_id:req.body.officeid},function (err,docs) {
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/officeadmin/officelist")
        }
    })
})
/*
 /编辑办公室
 */
router.get("/officeinfo/:officeid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Mb', userinfo.arr);
        Office.find({_id:req.params.officeid},function (err,docs) {
            if(err){
                res.render("nodata")
            }else {
                res.render('office/officeinfo_mng',{
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
/*
 /处理编辑办公室
 */
router.post("/update",function (req,res) {
    var obj = {
        name:req.body.name,
        picUrl:req.body.picUrl
    }
    Office.update({_id:req.body.officeid},obj,function(err,doce){
        if(err){
            res.render("nodata")
        }else{
            res.redirect('/officeadmin/officelist');
        }
    })
})

/**
 * 查看办公室的工位
 */
router.get("/stationlist/:officeid",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ma', userinfo.arr);
        var pagesize = 8;
        var counturl = "/officeadmin/getstation/1/"+req.params.officeid+'/'+pagesize + '/1';
        var dataurl = "/officeadmin/getstation/2/" +req.params.officeid+'/'+pagesize;
        res.render('station/stationlist_mng',{
            leftNav:leftNav,
            pagesize : pagesize,
            counturl:counturl,
            dataurl:dataurl,
            officeid:req.params.officeid,
            userinfo: userinfo.adminuserInfo
        });
    }else {
        res.render('login')
    }

})

/**
 * 查询工位
 */
router.get("/getstation/:type/:officeid/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Station.count({officeId:req.params.officeid}).exec(function(err,docs){
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
            Station.find({officeId:req.params.officeid}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    var priseids = new Array()
                    for(var i=0;i<docs.length;i++){
                        if((docs[i].enterpriseId != '') && (docs[i].status==1)){
                            priseids.push(docs[i].enterpriseId)
                        }
                    }
                    if(priseids.length > 0){
                        Enterprise.find({_id:{$in:priseids}},function(err,data){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            }else{
                                if(data.length > 0){
                                    for(var y=0;y<docs.length;y++){
                                        for(var x=0;x<data.length;x++){
                                            if(docs[y].enterpriseId == data[x]._id){
                                                docs[y].enterpriseName = data[x].priseName
                                            }

                                        }
                                    }
                                    res.status(200).json(docs);
                                }else{
                                    res.status(200).json(docs);
                                }

                            }
                        })
                    }else{
                        res.status(200).json(docs);
                    }
                    //res.status(200).json(docs);
                }
            })
            break;

    }
})
/**
 * 查看工位被预约信息
 */
router.get("/getorders/:officeid/:stationid",function(req,res){
    var obj = {
        goodsId:req.params.officeid,
        orderStatus:orderstatus.statusB10001,
        orderTime:{'$gte':new Date(new Date().toLocaleDateString()).getTime()}
    }
    Officeorder.find(obj,function(err,orders) {
        console.log(orders)
        if (orders.length > 0) {
            var stations = new Array()
            var userids = new Array()
            for (var m = 0; m < orders.length; m++) {
                for (var n = 0; n < orders[m].orderInfo.length; n++) {
                    if(orders[m].orderInfo[n].goodsId == req.params.stationid){
                        console.log(orders[m].orderInfo[n].orderTime)
                        var d = new Date(parseInt(orders[m].orderInfo[n].orderTime))
                        console.log(d)
                        var obj = {
                            userid:orders[m].userId,
                            ordertime:date.formatDatenow(d),

                        }
                        userids.push(orders[m].userId)
                        stations.push(obj)
                    }
                }
            }
            User.find({_id:{'$in':userids}},function(err,users) {
                if (err) {
                    res.status(3).json(finaldata);
                } else {
                    var finaldata = new Array()
                    for(var i=0;i<stations.length;i++){
                        for(var j=0;j<users.length;j++){
                            if(stations[i].userid == users[j]._id){
                                var json = {
                                    nickName:users[j].nickName
                                }
                                var newjson = eval('('+(JSON.stringify(stations[i])+JSON.stringify(json)).replace(/}{/,',')+')');
                                finaldata.push(newjson)
                            }
                        }
                    }
                    res.status(200).json(finaldata);
                }
            })
        } else {
            res.status(200).json(orders);
        }
    })
})
/**
 * 添加工位
 */
router.get("/addstation/:officeid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ma', userinfo.arr);
        res.render("station/addstation_mng",{
            leftNav:leftNav,
            officeid:req.params.officeid,
            userinfo: userinfo.adminuserInfo
        })
    }else {
        res.render('login')
    }
})

/**
 * 处理添加工位
 */
router.post("/insertstation",function(req,res){
    var station = new Station({
        officeId:req.body.officeId,                    //办公室id
        stationId:req.body.stationId,              //工位编号
        price1:req.body.price1*1,                  //普通用户价格
        price2:req.body.price2*1,              //入驻企业有期权价格
        price3:req.body.price3*1,            //入驻企业无期权价格
        //price4:Number,                   //
        enterpriseId:'',  //入驻企业id
        enterpriseName:'',
        status:0,          //工位状态1入驻企业占用2维修中
        orderTime:[],        //已被预约的时间
        createTime:Date.now(),
    })
    station.save(function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect('/officeadmin/stationlist/'+req.body.officeId)
        }
    })
})
/**
 * 删除工位
 */
router.post("/deletestation",function(req,res){
    //console.log(req.body.stationids)
    Station.findOne({_id:req.body.stationid},function(err,station){
        if(err){

        }else{
            if(station.enterpriseId == ''){
                Station.remove({_id:req.body.stationid},function(err,docs){
                    if(err){
                        res.json({
                            code:3
                        })
                    }else{
                        res.json({
                            code:0
                        })
                    }
                })
            }else{
                Lockauthority.find({roomId:req.body.officeid,userId:station.enterpriseUserId,type:'1'},function(err,docs) {
                    if (err) {
                        res.render('nodata')
                    } else {
                        if(docs.length > 0){
                            var arr = new Array()
                            for(var i=0;i<docs[0].stationids.length;i++){
                                if(docs[0].stationids[i] != req.body.stationid){
                                    arr.push(docs[0].stationids[i])
                                }
                            }
                            if(arr.length > 0){
                                Lockauthority.update({roomId:req.body.officeid,userId:station.enterpriseUserId,type:'1'},{stationids:arr},function(err,docs) {
                                    Station.remove({_id:req.body.stationid},function(err,docs){
                                        if(err){
                                            res.json({
                                                code:3
                                            })
                                        }else{
                                            res.json({
                                                code:0
                                            })
                                        }
                                    })
                                })
                            }else{
                                functions.cancelStation(station.enterpriseId,req.body.officeid,req.body.stationid,station.enterpriseUserId,function(err,data){
                                    if(err){
                                        res.render('nodata')
                                    }else{
                                        Station.remove({_id:req.body.stationid},function(err,docs){
                                            if(err){
                                                res.json({
                                                    code:3
                                                })
                                            }else{
                                                res.json({
                                                    code:0
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        }else{
                            functions.cancelStation(station.enterpriseId,req.body.officeid,req.body.stationid,station.enterpriseUserId,function(err,data){
                                if(err){
                                    res.render('nodata')
                                }else{
                                    Station.remove({_id:req.body.stationid},function(err,docs){
                                        if(err){
                                            res.json({
                                                code:3
                                            })
                                        }else{
                                            //res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                                            res.json({
                                                code:0
                                            })
                                        }
                                    })
                                }
                            })
                        }

                    }
                })
            }

        }
    })

})

/**
 * 查看工位是否有预约信息
 */
router.post("/checkorderinfo",function(req,res){
    var obj = {
        goodsId:req.body.officeid,
        orderStatus:orderstatus.statusB10001,
        orderTime:{'$gte':new Date(new Date().toLocaleDateString()).getTime()}
    }
    Officeorder.find(obj,function(err,orders) {
        if (orders.length > 0) {
            var stations = new Array()
            var userids = new Array()
            for (var m = 0; m < orders.length; m++) {
                for (var n = 0; n < orders[m].orderInfo.length; n++) {
                    if(orders[m].orderInfo[n].goodsId == req.body.stationid){
                        var d = new Date(parseInt(orders[m].orderInfo[n].orderTime))
                        var obj = {
                            userid:orders[m].userId,
                            ordertime:date.formatDatenow(d),

                        }
                        userids.push(orders[m].userId)
                        stations.push(obj)
                    }
                }
            }
            if(stations.length > 0){
                res.status(200).json({
                    code:'1',
                    name:'该工位有预约信息，不能删除'
                });
            }else{
                res.status(200).json({
                    code:'0',
                    name:'ok'
                });
            }


        } else {
            res.status(200).json({
                code:'0',
                name:'ok'
            });
        }
    })
})

/**
 * 编辑工位
 */
router.get("/stationinfo/:stationid/:officeid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid =userinfo.adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('Ma', userinfo.arr);
        Station.find({_id:req.params.stationid},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                var obj = {
                    goodsId:req.params.officeid,
                    orderStatus:orderstatus.statusB10001,
                    orderTime:{'$gte':new Date(new Date().toLocaleDateString()).getTime()}
                }
                console.log()
                Officeorder.find(obj,function(err,orders) {
                    var arr
                    if (orders.length > 0) {
                        var stations = new Array()
                        for (var m = 0; m < orders.length; m++) {
                            for (var n = 0; n < orders[m].orderInfo.length; n++) {
                                if (orders[m].orderInfo[n].goodsId == req.params.stationid) {
                                    var d = new Date(parseInt(orders[m].orderInfo[n].orderTime))
                                    var obj = {
                                        userid: orders[m].userId,
                                        ordertime: date.formatDatenow(d),

                                    }
                                    stations.push(obj)
                                }
                            }
                        }
                        arr = stations
                    }else{
                        arr = orders
                    }
                    if(arr.length > 0){
                        res.render("station/stationinfo_mng",{
                            leftNav:leftNav,
                            data:docs[0],
                            officeid:req.params.officeid,
                            prise:[],
                            userinfo: userinfo.adminuserInfo
                        })
                    }else{
                        Enterprise.find({isCheck:1,interspaceId:interspaceid},function(err,prise){
                            if(err){
                                res.render('nodata')
                            }else{
                                res.render("station/stationinfo_mng",{
                                    leftNav:leftNav,
                                    data:docs[0],
                                    officeid:req.params.officeid,
                                    prise:prise,
                                    userinfo: userinfo.adminuserInfo
                                })
                            }
                        })
                    }
                })

            }
        })
    }else {
        res.render('login')
    }
})

/**
 * 修改工位
 */
router.post("/updatestation",function(req,res){
    var obj = {
        stationId:req.body.stationId,              //工位编号
        price1:req.body.price1,                  //入驻企业有期权价格
        price2:req.body.price2,              //入驻企业无期权价格
        price3:req.body.price3,            //普通用户价格
    }
    Station.findOne({_id:req.body.stationid},function(err,station) {
        if (err) {
            res.render('nodata')
        } else {
            if(station.enterpriseId != ''){
                //改变企业占用工位的状态
                if(req.body.enterpriseId == '0') {     //改为预约状态
                    obj.status = 0;
                    obj.enterpriseId = '';
                    obj.enterpriseName = ''
                    Station.update({_id: req.body.stationid}, obj, function (err, docs) {
                        if (err) {
                            res.render('nodata')
                        } else {
                            Lockauthority.find({roomId:req.body.officeid,userId:station.enterpriseUserId,type:'1'},function(err,docs) {
                                if (err) {
                                    res.render('nodata')
                                } else {
                                    var arr = new Array()
                                    for(var i=0;i<docs[0].stationids.length;i++){
                                        if(docs[0].stationids[i] != req.body.stationid){
                                            arr.push(docs[0].stationids[i])
                                        }
                                    }
                                    if(arr.length > 0){
                                        Lockauthority.update({roomId:req.body.officeid,userId:station.enterpriseUserId,type:'1'},{stationids:arr},function(err,docs) {
                                            res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                                        })

                                    }else{
                                        functions.cancelStation(station.enterpriseId,req.body.officeid,req.body.stationid,station.enterpriseUserId,function(err,data){
                                            if(err){
                                                res.render('nodata')
                                            }else{
                                                res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                                            }
                                        })
                                    }
                                }
                            })

                        }
                    })
                }else if(req.body.enterpriseId == '3'){   //改为维护中
                    obj.status = 2;
                    obj.enterpriseId = '';
                    obj.enterpriseName = ''
                    Station.update({_id: req.body.stationid}, obj, function (err, docs) {
                        if (err) {
                            res.render('nodata')
                        } else {
                            Lockauthority.find({roomId:req.body.officeid,userId:station.enterpriseUserId,type:'1'},function(err,docs) {
                                if (err) {
                                    res.render('nodata')
                                } else {
                                    var arr = new Array()
                                    for(var i=0;i<docs[0].stationids.length;i++){
                                        if(docs[0].stationids[i] != req.body.stationid){
                                            arr.push(docs[0].stationids[i])
                                        }
                                    }
                                    if(arr.length > 0){
                                        res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                                    }else{
                                        functions.cancelStation(station.enterpriseId,req.body.officeid,req.body.stationid,station.enterpriseUserId,function(err,data){
                                            if(err){
                                                res.render('nodata')
                                            }else{
                                                res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                }else {    //分配给其他企业
                    console.log(req.body.officeid)
                    obj.status = 1;
                    obj.enterpriseId = (req.body.enterpriseId).split(',')[0] ;
                    obj.enterpriseUserId = (req.body.enterpriseId).split(',')[1] ;
                    //obj.enterpriseName = ''
                    Station.update({_id: req.body.stationid}, obj, function (err, docs) {
                        if (err) {
                            res.render('nodata')
                        } else {
                            if(station.enterpriseId == (req.body.enterpriseId).split(',')[0]){
                                res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                            }else{
                                Lockauthority.find({roomId:req.body.officeid,userId:station.enterpriseUserId,type:'1'},function(err,docs) {
                                    if (err) {
                                        res.render('nodata')
                                    } else {
                                        if(docs.length > 0){
                                            var arr = new Array()
                                            for(var i=0;i<docs[0].stationids.length;i++){
                                                if(docs[0].stationids[i] != req.body.stationid){
                                                    arr.push(docs[0].stationids[i])
                                                }
                                            }
                                            if(arr.length > 0){
                                                res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                                            }else{
                                                functions.cancelStation(station.enterpriseId,req.body.officeid,req.body.stationid,station.enterpriseUserId,function(err,data){
                                                    if(err){
                                                        res.render('nodata')
                                                    }else{
                                                        Lockauthority.find({roomId:req.body.officeid,userId:(req.body.enterpriseId).split(',')[1],type:'1'},function(err,docs) {
                                                            if (err) {
                                                                res.render('nodata')
                                                            } else {
                                                                if (docs.length > 0) {
                                                                    docs[0].stationids.push(req.body.stationid)
                                                                    Lockauthority.update({roomId:req.body.officeid,userId:(req.body.enterpriseId).split(',')[1]},docs[0],function(err,data){
                                                                        if(err){
                                                                            res.render('nodata')
                                                                        }else{
                                                                            res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                                                                        }
                                                                    })
                                                                }else{
                                                                    Lock.findOne({roomId:req.body.officeid},'mac',function(err,lock){
                                                                        var json = new Lockauthority({
                                                                            mac:lock.mac,           //设备mac地址（唯一）
                                                                            roomId:req.body.officeid,       //房间id
                                                                            userId:(req.body.enterpriseId).split(',')[1],       //用户id
                                                                            stationids:[req.body.stationid],
                                                                            type:'1',         //1永久性的2非永久性的
                                                                            endTime:9999999999999,
                                                                            createTime:Date.now(),    //发布时间
                                                                        })
                                                                        json.save(function(err,locks){
                                                                            if(err){
                                                                                res.render('nodata')
                                                                            }else{
                                                                                res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                                                                            }
                                                                        })
                                                                    })

                                                                }
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        }else{
                                            console.log('*********************************************')
                                            functions.cancelStation(station.enterpriseId,req.body.officeid,req.body.stationid,station.enterpriseUserId,function(err,data){
                                                if(err){
                                                    res.render('nodata')
                                                }else{
                                                    Lockauthority.find({roomId:req.body.officeid,userId:(req.body.enterpriseId).split(',')[1],type:'1'},function(err,docs) {
                                                        if (err) {
                                                            res.render('nodata')
                                                        } else {
                                                            if (docs.length > 0) {
                                                                docs[0].stationids.push(req.body.stationid)
                                                                Lockauthority.update({roomId:req.body.officeid,userId:(req.body.enterpriseId).split(',')[1]},docs[0],function(err,data){
                                                                    if(err){
                                                                        res.render('nodata')
                                                                    }else{
                                                                        res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                                                                    }
                                                                })
                                                            }else{
                                                                Lock.findOne({roomId:req.body.officeid},'mac',function(err,lock){
                                                                    var json = new Lockauthority({
                                                                        mac:lock.mac,           //设备mac地址（唯一）
                                                                        roomId:req.body.officeid,       //房间id
                                                                        userId:(req.body.enterpriseId).split(',')[1],       //用户id
                                                                        stationids:[req.body.stationid],
                                                                        type:'1',         //1永久性的2非永久性的
                                                                        endTime:9999999999999,
                                                                        createTime:Date.now(),    //发布时间
                                                                    })
                                                                    json.save(function(err,locks){
                                                                        if(err){
                                                                            res.render('nodata')
                                                                        }else{
                                                                            console.log(locks)
                                                                            res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                                                                        }
                                                                    })
                                                                })

                                                            }
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    })

                }
            }else{
                //改变非企业占用的工位状态
                if(req.body.enterpriseId == '0') {     //改为预约状态
                    obj.status = 0;
                    obj.enterpriseId = '';
                    obj.enterpriseName = ''
                    Station.update({_id: req.body.stationid}, obj, function (err, docs) {
                        if (err) {
                            res.render('nodata')
                        } else {
                            res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                        }
                    })
                }else if(req.body.enterpriseId == '3'){   //改为维护中
                    obj.status = 2;
                    obj.enterpriseId = '';
                    obj.enterpriseName = ''
                    Station.update({_id: req.body.stationid}, obj, function (err, docs) {
                        if (err) {
                            res.render('nodata')
                        } else {
                            res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                        }
                    })
                }else{    //分配给其他企业
                    obj.status = 1;
                    obj.enterpriseId = (req.body.enterpriseId).split(',')[0] ;
                    obj.enterpriseUserId = (req.body.enterpriseId).split(',')[1] ;
                    //obj.enterpriseName = ''
                    Station.update({_id: req.body.stationid}, obj, function (err, docs) {
                        if (err) {
                            res.render('nodata')
                        } else {
                            Lockauthority.find({roomId:req.body.officeid,userId:(req.body.enterpriseId).split(',')[1],type:'1'},function(err,docs) {
                                if (err) {
                                    res.render('nodata')
                                } else {
                                    if (docs.length > 0) {
                                        docs[0].stationids.push(req.body.stationid)
                                        Lockauthority.update({roomId:req.body.officeid,userId:(req.body.enterpriseId).split(',')[1]},docs[0],function(err,data){
                                            if(err){
                                                res.render('nodata')
                                            }else{
                                                res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                                            }
                                        })
                                    }else{
                                        Lock.findOne({roomId:req.body.officeid},'mac',function(err,lock){
                                            var json = new Lockauthority({
                                                mac:lock.mac,           //设备mac地址（唯一）
                                                roomId:req.body.officeid,       //房间id
                                                userId:(req.body.enterpriseId).split(',')[1],       //用户id
                                                stationids:[req.body.stationid],
                                                type:'1',         //1永久性的2非永久性的
                                                endTime:9999999999999,
                                                createTime:Date.now(),    //发布时间
                                            })
                                            json.save(function(err,locks){
                                                if(err){
                                                    res.render('nodata')
                                                }else{
                                                    res.redirect('/officeadmin/stationlist/'+req.body.officeid)
                                                }
                                            })
                                        })

                                    }
                                }
                            })
                        }
                    })
                }
            }
        }
    })
    
})

/**
 * 工位订单
 */
router.get("/stationorder",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Mc', userinfo.arr);
        var pagesize = 7;
        var counturl = "/officeadmin/stationorder/1/"+pagesize + '/1';
        var dataurl = "/officeadmin/stationorder/2"+ '/' + pagesize;
        res.render('station/stationorder_mng',{
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

router.get("/stationorder/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Officeorder.count({interspaceId:interspaceid,type:1,orderStatus:orderstatus.statusB10001}).exec(function(err,docs){
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
                Officeorder.find({interspaceId:interspaceid,type:1}).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{

                        var userids = new Array()
                        var officeids = new Array()
                        for(var i=0;i<docs.length;i++){
                            userids.push(docs[i].userId)
                            officeids.push(docs[i].goodsId)
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
                                                time:functions.timeFormat(docs[x].orderTime)
                                            }
                                            var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                            data.push(newjson)
                                        }
                                    }
                                }
                                Office.find({_id:{$in:officeids}},function(err,office){
                                    if(err){

                                    }else{
                                        var reldata = new Array()
                                        for(var m=0;m<data.length;m++){
                                            for(var n=0;n<office.length;n++){
                                                if(office[n]._id == data[m].goodsId){
                                                    var json = {
                                                        officeName:office[n].name
                                                    }
                                                    var jsonstr = eval('('+(JSON.stringify(data[m])+JSON.stringify(json)).replace(/}{/,',')+')');
                                                    reldata.push(jsonstr)
                                                }
                                            }
                                        }
                                        var result = []
                                        for(var m=0;m<reldata.length;m++){
                                            switch(reldata[m].orderStatus){
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
                                            var jsonstr = eval('('+(JSON.stringify(reldata[m])+JSON.stringify(json)).replace(/}{/,',')+')');
                                            result.push(jsonstr)
                                        }
                                        res.status(200).json(result);
                                    }
                                })

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

router.get("/retgr",function(req,res){
    Lockauthority.remove({_id:'5993ba0d92bf7a10c90caa77'},function(err,docs){
        res.send(docs)
    })
})
module.exports = router;