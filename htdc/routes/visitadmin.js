/**
 * Created by Administrator on 2017/4/20.
 */
var express = require('express');
var router = express.Router();
var functions = require("../common/functions");
var mongoose = require("mongoose");
var Visit = mongoose.model("Visit");




router.get("/visit_list",function (req,res){
    Visit.find({},function(err,visit_list){
        res.send(visit_list)
    })
})

router.get("/visit_remove",function (req,res){
    Visit.remove({},function(err,visit_list){
        res.send(visit_list)
    })
})
/*
 /查询所有活动
 */
router.get("/getallactivities/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Activity.count().exec(function(err,docs){
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
            Activity.find({}).sort({isHot:-1,hotTime:-1,createTime:-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    var data=new Array
                    for(a in docs){
                        var obj={
                            startTimes:functions.timeFormat(docs[a].startTime*1),
                            endTimes:functions.timeFormat(docs[a].endTime*1),
                        }
                        var json = eval('('+(JSON.stringify(docs[a])+JSON.stringify(obj)).replace(/}{/,',')+')');
                        console.log(json)
                        data.push(json)
                    }
                    console.log(data)
                    res.status(200).json(data);
                }
            })
            break;

    }
})

/**
 * 置顶操作
 */
router.get("/hot/:activityid",function(req,res,next){
    Activity.update({_id:req.params.activityid},{hotTime:Date.now(),isHot:1},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            res.status(200).json(ret1);
        }else{
            res.redirect('/activityadmin/activitylist')
        }
    })
})


/**
 * 取消置顶操作
 */
router.get("/canclehot/:activityid/:activitytime",function(req,res,next){
    Activity.update({_id:req.params.activityid},{hotTime:req.params.activitytime,isHot:0},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            res.status(200).json(ret1);
        }else{
            res.redirect('/activityadmin/activitylist')
        }
    })
})

/**
 * 模糊查询
 */
router.get('/searchactivity/:name',function(req,res){
    var userinfo = req.session.adminuser;
    var name=req.params.name
    if(userinfo) {
        var pagesize=3
        var leftNav = functions.createLeftNavByCodes('Ka', userinfo.arr);
        var counturl = "/activityadmin/getactivit/1/"+name+'/'+pagesize + '/1';
        var dataurl = "/activityadmin/getactivit/2/"+name +'/'+ pagesize;
        res.render('activity/activitylist_mng',{
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
 * 搜索所有活动
 */
router.get("/getactivit/:type/:name/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var qs=new RegExp(req.params.name);
    var  obj={
        name:qs
    }
    switch(req.params.type){
        case '1':
            Activity.count(obj).exec(function(err,docs){
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
            Activity.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    var data=new Array
                    for(a in docs){
                        var obj={
                            startTimes:functions.timeFormat(docs[a].startTime*1),
                            endTimes:functions.timeFormat(docs[a].endTime*1),
                        }
                        var json = eval('('+(JSON.stringify(docs[a])+JSON.stringify(obj)).replace(/}{/,',')+')');
                        console.log(json)
                        data.push(json)
                    }
                    console.log(data)
                    res.status(200).json(data);
                }
            })
            break;

    }
})
/*
 /
添加活动
 */
router.get("/addactivity",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Kb', userinfo.arr);
        res.render('activity/addactivity_mng', {
            leftNav: leftNav,
            userinfo: userinfo.adminuserInfo
        })

    }else {
        res.render('login')
    }
})
/*
 /处理添加活动
 */
router.post("/insertactivity",function(req,res){
    var startTime=Date.parse(new Date(req.body.startTime))
    var endTime=Date.parse(new Date(req.body.endTime))
    var obj={
        name:req.body.name,
        linkPlace:req.body.linkPlace,
        startTime:startTime,
        endTime:endTime,
        picUrl:req.body.picUrl
    }
    var ad = new Activity(obj);
    ad.save(function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/activityadmin/activitylist")
        }
    })
})
/*
/编辑活动信息
 */
router.get("/updateactivity/:activityid",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Kb', userinfo.arr);
        Activity.find({_id:req.params.activityid},function (err,docs) {
            //console.log(docs[0].startTime)
            var obj={
                start:functions.timeFormat(docs[0].startTime*1),
                end:functions.timeFormat(docs[0].endTime*1)
            }
            var json = eval('('+(JSON.stringify(docs[0])+JSON.stringify(obj)).replace(/}{/,',')+')');
            res.render('activity/activityinfo_mng',{
                data:json,
                leftNav:leftNav,
                userinfo: userinfo.adminuserInfo
            })
        })
    }else {
        res.render('login')
    }
})
/*
 更新活动信息

 */
router.post("/update",function (req,res) {
    var startTime=Date.parse(new Date(req.body.startTime))
    var endTime=Date.parse(new Date(req.body.endTime))
    var obj = {
        name:req.body.name,
        linkPlace:req.body.linkPlace,
        startTime:startTime,
        endTime:endTime,
        picUrl:req.body.picUrl,
        //createTime:Number,   //创建时间
    }
    Activity.update({_id:req.body.activityid},obj,function(err,doce){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/activityadmin/activitylist");
        }
    })
})
/*
 /删除活动
 */
router.post("/deleteactivity",function(req,res){
    Activity.remove({_id:req.body.activityid},function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/activityadmin/activitylist")
        }
    })
})

module.exports = router;