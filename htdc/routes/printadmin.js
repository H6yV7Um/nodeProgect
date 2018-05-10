var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var mongoose = require("mongoose");
var Print = mongoose.model("Print");
var User = mongoose.model("User");
var Invitejob = mongoose.model("Invitejob");
var Applyforjob = mongoose.model("Applyforjob");
/*
 查询所有打印复印预约
 */
router.get("/copylist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Jc', userinfo.arr);
        var pagesize = 7;
        var counturl = "/printadmin/getcopyslist/1/"+pagesize + '/1';
        var dataurl = "/printadmin/getcopyslist/2"+ '/' + pagesize;
        res.render('print/copylist_mng',{
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

router.get("/getcopyslist/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var obj={
        type:"2"
    }
    switch(req.params.type){
        case '1':
            Print.count(obj).exec(function(err,docs){
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
            Print.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    var datas=new Array
                    var aa=new Array
                    for(x in docs){
                        aa.push(docs[x].userId)
                    }
                    User.find({_id:{$in:aa}},function (err,name){
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            res.status(200).json(ret1);
                        }else {
                            for(a in docs){
                                for(b in name){
                                    if(docs[a].userId==name[b]._id){
                                        var obj={
                                            userName:name[b].nickName,
                                            dates:functions.timeFormat(docs[a].date*1),
                                            creatTimes:functions.timeFormat(docs[a].createTime*1),
                                        }
                                        var json = eval('('+(JSON.stringify(docs[a])+JSON.stringify(obj)).replace(/}{/,',')+')');
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
/加班预约
 */
router.get("/overtimelist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ic', userinfo.arr);
        var pagesize = 7;
        var counturl = "/printadmin/getovertimeslist/1/"+pagesize + '/1';
        var dataurl = "/printadmin/getovertimeslist/2"+ '/' + pagesize;
        res.render('print/overtimelist_mng',{
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

router.get("/getovertimeslist/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var obj={
            interspaceId:interspacesid,
            type:"1"
        }
        switch(req.params.type){
            case '1':
                Print.count(obj).exec(function(err,docs){
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
                Print.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var datas=new Array
                        var aa=new Array
                        for(x in docs){
                            aa.push(docs[x].userId)
                        }
                        User.find({_id:{$in:aa}},function (err,name) {
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            }else {
                                for(a in docs){
                                    for(b in name){
                                        if(docs[a].userId==name[b]._id){
                                            var obj={
                                                userName:name[b].nickName,
                                                startTimes:functions.timeFormat(docs[a].startTime*1),
                                                createTimes:functions.timeFormat(docs[a].createTime*1),
                                                endTimes:functions.timeFormat(docs[a].endTime*1),
                                            }
                                            var json = eval('('+(JSON.stringify(docs[a])+JSON.stringify(obj)).replace(/}{/,',')+')');
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
    }else{
        res.render('login')
    }

})
/*
 /删除路演厅
 */
router.get("/deleteroadshow/:interspaceId",function (req,res) {
    Roadshow.remove({_id:req.params.interspaceId},function (err,docs) {
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
    var leftNav = functions.createLeftNavByCode('Ra');
    Roadshow.findOne({_id:req.params.interspaceId},function (err,docs) {
        if(err){
            res.render("nodata")
        }else {
            res.render('roadshowadmin/roadshowinfo_mng',{
                data:docs,
                leftNav:leftNav
            })
        }
    })

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

router.get("/invitelist",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Jd', userinfo.arr);
        var pagesize = 7;
        var counturl = "/printadmin/getinvitelist/1/"+pagesize + '/1';
        var dataurl = "/printadmin/getinvitelist/2"+ '/' + pagesize;
        res.render('print/invitelist_mng',{
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

router.get("/getinvitelist/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var obj={
            interspaceId:interspacesid,
        }
        switch(req.params.type){
            case '1':
                Invitejob.count(obj).exec(function(err,docs){
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
                Invitejob.find(obj).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var data = []
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


router.get("/applyforjoblist",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Je', userinfo.arr);
        var pagesize = 7;
        var counturl = "/printadmin/applyforjoblist/1/"+pagesize + '/1';
        var dataurl = "/printadmin/applyforjoblist/2"+ '/' + pagesize;
        res.render('print/applyforjoblist_mng',{
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

router.get("/applyforjoblist/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var obj={
            interspaceId:interspacesid,
        }
        switch(req.params.type){
            case '1':
                Applyforjob.count(obj).exec(function(err,docs){
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
                Applyforjob.find(obj).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var data = []
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
module.exports = router;