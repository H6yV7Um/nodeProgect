var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var mongoose = require("mongoose");
var System = mongoose.model("System");


/*
 /添加体系
 */
router.get("/addsystem",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pd', userinfo.arr);
        res.render("system/addsystem_mng",{
            leftNav:leftNav,
            userinfo: userinfo.adminuserInfo
        })
    }else {
        res.render('login')
    }


})

/*
 /处理添加体系
 */
router.post("/insertsystem",function(req,res){
    console.log(req.body)
    var ad = new System(req.body);
    ad.save(function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/system/systemlist")
        }
    })
})

/*
 /查询所有体系
 */
router.get("/systemlist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var pagesize=3
        var leftNav = functions.createLeftNavByCodes('Pd', userinfo.arr);
        var counturl = "/system/getsystems/1/"+pagesize + '/1';
        var dataurl = "/system/getsystems/2"+ '/' + pagesize;
        res.render('system/systemlist_mng',{
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

router.get("/getsystems/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            System.count().exec(function(err,docs){
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
            System.find().skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
 /删除体系
 */
router.post("/delete",function (req,res) {
    System.remove({_id:req.body.systemid},function (err,docs) {
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/system/systemlist")
        }
    })
})
/*
 /编辑体系
 */
router.get("/systeminfo/:systemid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Pd', userinfo.arr);
        System.find({_id:req.params.systemid},function (err,docs) {
            if(err){
                res.render("nodata")
            }else {
                res.render('system/systeminfo_mng',{
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
/处理编辑体系
 */
router.post("/update",function (req,res) {
    var obj = {
        name:req.body.name,
        picUrl1:req.body.picUrl1,       //静态
        picUrl2:req.body.picUrl2,       //  动态
    }
    System.update({_id:req.body.systemid},obj,function(err,doce){
        if(err){
            res.render("nodata")
        }else{
            res.redirect('/system/systemlist');
        }
    })
})

module.exports = router;