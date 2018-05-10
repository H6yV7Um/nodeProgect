/**
 * Created by Administrator on 2017/4/20.
 */
var express = require('express');
var router = express.Router();
var functions = require("../common/functions");
var orderstatus = require("../common/orderstatus");
var mongoose = require("mongoose");
var Course = mongoose.model("Course");
var Teacher = mongoose.model("Teacher");
var System = mongoose.model("System");
var Interspace = mongoose.model("Interspace");
var Goods = mongoose.model("Goods");
var Officeorder = mongoose.model("Officeorder");
var User = mongoose.model("User");
var Trackinterspace = mongoose.model("Trackinterspace");



/*
/查看所有课程
 */
router.get("/courselist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var pagesize=7
        var leftNav = functions.createLeftNavByCodes('Pe', userinfo.arr);
        var counturl = "/course/getallcourses/1/"+pagesize + '/1';
        var dataurl = "/course/getallcourses/2"+ '/' + pagesize;
        Teacher.find({},function (err,tdata) {
            if(err){
                res.render("nodata")
            }else {
                res.render('course/courselist_mng',{
                    leftNav:leftNav,
                    pagesize : pagesize,
                    counturl:counturl,
                    dataurl:dataurl,
                    tdata:tdata,
                    userinfo: userinfo.adminuserInfo
                });
            }
        });
    }else {
        res.render('login')
    }
})
/*
 /查询所有课程
 */
router.get("/getallcourses/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Goods.count({'type':'3'}).exec(function(err,docs){
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
            Goods.find({'type':'3'}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    var ids=new Array
                    for(var i=0;i<docs.length;i++){
                        ids.push(docs[i].interspaceId)
                    }
                    Interspace.find({_id:{$in:ids}},function (err,inters) {
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            res.status(200).json(ret1);
                        }else {
                            var datas=new Array
                            for(var x=0;x<docs.length;x++){
                                for(var y=0;y<inters.length;y++){
                                    if(docs[x].interspaceId==inters[y]._id){
                                        var obj={
                                            inter:inters[y].interspaceName,
                                           startTimes:functions.timeFormat(docs[x].startTime*1),
                                            endTimes:functions.timeFormat(docs[x].endTime*1),
                                        }
                                        var json = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                        datas.push(json)
                                    }
                                }
                            }
                            res.status(200).json(datas);
                        }
                    })

                }
            })
            break;

    }
})
/**
 * 搜索列表
 */
router.get('/searchcourse/:goodsName',function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var pagesize=7
        var goodsName=req.params.goodsName
        var leftNav = functions.createLeftNavByCodes('Pe', userinfo.arr);
        var counturl = "/course/getallga/1/"+goodsName+'/'+pagesize + '/1';
        var dataurl = "/course/getallga/2/"+goodsName +'/'+ pagesize;
        Teacher.find({},function (err,tdata) {
            if(err){
                res.render("nodata")
            }else {
                res.render('course/courselist_mng',{
                    leftNav:leftNav,
                    pagesize : pagesize,
                    counturl:counturl,
                    dataurl:dataurl,
                    tdata:tdata,
                    userinfo: userinfo.adminuserInfo
                });
            }
        });
    }else {
        res.render('login')
    }

})

router.get("/getallga/:type/:goodsName/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var qs=new RegExp(req.params.goodsName);
    var obj={
        goodsName:qs
    }
    switch(req.params.type){
        case '1':
            Goods.count(obj).exec(function(err,docs){
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
            Goods.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    console.log(docs)
                    var ids=new Array
                    for(var i=0;i<docs.length;i++){
                        ids.push(docs[i].interspaceId)
                    }
                    Interspace.find({_id:{$in:ids}},function (err,inters) {
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            res.status(200).json(ret1);
                        }else {
                            var datas=new Array
                            for(var x=0;x<docs.length;x++){
                                for(var y=0;y<inters.length;y++){
                                    if(docs[x].interspaceId==inters[y]._id){
                                        var obj={
                                            inter:inters[y].interspaceName
                                        }
                                        var json = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                        datas.push(json)
                                        console.log(datas)
                                    }
                                }
                            }
                            res.status(200).json(datas);
                        }
                    })
                }
            })
            break;

    }
})
/*
/

 */
router.get("/addcourse/:teacherid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pb', userinfo.arr);
        System.find({},function(err,systems){
            if(err){
                res.render('nodata')
            }else{
                Teacher.find({_id:req.params.teacherid},function (err,teacher) {
                    if(err){
                        res.render("nodata")
                    }else{
                        Trackinterspace.find({},function (err,interspaces) {
                            if(err){
                                res.render("nodata")
                            }else {
                                res.render("course/addcourse_mng",{
                                    leftNav:leftNav,
                                    systems:systems,
                                    teacher:teacher[0],
                                    interspaces:interspaces,
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

/*
/处理添加课程
 */
router.post("/insertcourse",function(req,res){
    var startTime=Date.parse(new Date(req.body.startTime))
    var endTime=Date.parse(new Date(req.body.endTime))
    var obj={
        type:"3",
        teacherId:req.body.teacherId,
        goodsName:req.body.goodsName,
        goodsPic:req.body.goodsPic,
        startTime:startTime,
        endTime:endTime,
        detailPlace:req.body.detailPlace,
        interspaceId:req.body.interspaceId,
        goodsDescribe:req.body.goodsDescribe,
        goodsInfo:req.body.goodsInfo,
        typeId:req.body.typeId,
        price1:req.body.price1,
        price2:req.body.price2,
        price3:req.body.price3,
        useInfo:req.body.useinfo
    }
    console.log(obj)
    var ad = new Goods(obj);
    ad.save(function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/course/courselist")
        }
    })
})
/*
\/查询单个导师的所有课程
 */
router.get("/getcourses/:teacherid",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pa', userinfo.arr);
        var pagesize = 3;
        var teacherid=req.params.teacherid;
        var counturl = "/course/getcoursesbyid/1/"+teacherid + '/'+pagesize + '/1';
        var dataurl = "/course/getcoursesbyid/2/"+teacherid + '/'+pagesize;
        Teacher.find({_id:teacherid},function (err,tdata) {
            if(err){
                res.render("nodata")
            }else {
                console.log(tdata)
                res.render('course/tcourselist_mng', {
                    leftNav: leftNav,
                    pagesize: pagesize,
                    counturl: counturl,
                    dataurl: dataurl,
                    tdata: tdata[0],
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    }else {
        res.render('login')
    }

})
/*
 /
 */
router.get("/getcoursesbyid/:type/:teacherid/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    console.log(req.params.teacherid)
    var obj = {
        teacherId:req.params.teacherid
    }
    switch(req.params.type){
        case '1':
            Goods.count(obj).exec(function(err,docs){
                console.log(docs)
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
            Goods.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    var ids=new Array
                    for(var i=0;i<docs.length;i++){
                        ids.push(docs[i].interspaceId)
                    }
                    Trackinterspace.find({_id:{$in:ids}},function (err,inters) {
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            res.status(200).json(ret1);
                        }else {
                            var datas=new Array
                            for(var x=0;x<docs.length;x++){
                                for(var y=0;y<inters.length;y++){
                                    if(docs[x].interspaceId==inters[y]._id){
                                        var obj={
                                            inter:inters[y].name,
                                            startTimes:functions.timeFormat(docs[x].startTime*1),
                                            //endTimes:functions.timeFormat(docs[x].endTime*1),
                                        }
                                        var json = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                        datas.push(json)
                                    }
                                }
                            }
                            res.status(200).json(datas);
                        }
                    })
                }
            })
            break;

    }
})
/*
 /编辑课程信息
 */
router.get("/updatecourse/:courseid,:teacherid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pb', userinfo.arr);
        Goods.find({_id:req.params.courseid},function(err,docs){
            if(err){
                res.render("nodata")
            }else{
                System.find({},function (err,systems) {
                    if(err){
                        res.render("nodata")
                    }else {
                        var ttype;
                        for(var i=0;i<systems.length;i++){
                            if(systems[i]._id==docs[0].typeId){
                                ttype=systems[i].name
                            }
                        }
                        var inter;
                        Trackinterspace.find({},function (err,interspaces) {
                            if(err){
                                res.render("nodata")
                            }else {
                                for(var x=0;x<interspaces.length;x++){
                                    if(interspaces[x]._id==docs[0].interspaceId){
                                        inter=interspaces[x].name
                                    }
                                }
                                Teacher.find({_id:req.params.teacherid},function (err,tdata) {
                                    if(err){
                                        res.render("nodata")
                                    }else {
                                        var obj={
                                            start:functions.timeFormat(docs[0].startTime*1),
                                            end:functions.timeFormat(docs[0].endTime*1)
                                        }

                                        var json = eval('('+(JSON.stringify(docs[0])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                        res.render("course/courseinfo_mng",{
                                            systems:systems,
                                            data:json,
                                            interspaces:interspaces,
                                            onet:tdata[0],
                                            leftNav:leftNav,
                                            ttype:ttype,
                                            inter:inter,
                                            userinfo: userinfo.adminuserInfo
                                        })
                                    }
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

/*
 更新课程信息

 */
router.post("/updatecourse",function (req,res) {
    var startTime=Date.parse(new Date(req.body.startTime))
    var endTime=Date.parse(new Date(req.body.endTime))
    var obj = {
       // teacherId:req.body.teacherId,
        goodsName:req.body.goodsName,
        goodsPic:req.body.goodsPic,
        startTime:startTime,
        endTime:endTime,
        detailPlace:req.body.detailPlace,
        interspaceId:req.body.interspaceId,
        goodsDescribe:req.body.goodsDescribe,
        goodsInfo:req.body.goodsInfo,
        typeId:req.body.typeId,
        price1:req.body.price1,
        price2:req.body.price2,
        price3:req.body.price3,
        useInfo:req.body.useInfo
    }
    Goods.update({_id:req.body.courseid},obj,function(err,doce){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/course/courselist");
        }
    })
})
/*
/删除课程
 */

router.post("/delete",function(req,res){
    Goods.remove({_id:req.body.courseid},function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/course/courselist")
        }
    })
})
/**
 * 课程订单
 */
router.get("/courseorder",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pf', userinfo.arr);
        var pagesize = 7;
        var counturl = "/course/courseorder/1/"+pagesize + '/1';
        var dataurl = "/course/courseorder/2"+ '/' + pagesize;
        res.render('course/courseorder_mng',{
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

router.get("/courseorder/:type/:pagesize/:page",function(req,res,next){
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
                console.log("@@@@@@@@@@@@@@2")
                Officeorder.count(obj).exec(function(err,docs){
                    if(err){
                        console.log(err)
                        console.log("============")
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        console.log(docs)
                        console.log("&&&&&&&&&&&&&&&&")
                        res.status(200).json(docs);
                    }
                })
                break;
            case '2':
                Officeorder.find(obj).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        console.log("====66666=====")
                        console.log(err)
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        console.log('`````````````````````````')
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
 * 消费码搜索
 */
router.get("/searchorder/:data",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pf', userinfo.arr);
        var pagesize = 7;
        var counturl = "/course/courseorder/1/"+req.params.data+'/'+pagesize + '/1';
        var dataurl = "/course/courseorder/2/"+req.params.data+'/'+ pagesize;
        res.render('course/courseorder_mng',{
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

router.get("/courseorder/:type/:data/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var qs=new RegExp(req.params.data);
        var interspaceid = userinfo.adminuserInfo.interspaceId
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
 * 确认收货
 */
router.post("/updateorder",function(req,res){
    //{ orderid: '59340728dc5f1b2d4c2a752b' }
    Officeorder.update({_id:req.body.orderid},{'orderStatus':orderstatus.statusU10001},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect("/course/courseorder")
        }
    })
})
module.exports = router;