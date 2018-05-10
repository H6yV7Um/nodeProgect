var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var mongoose = require("mongoose");
var Company = mongoose.model("Company");


/*
 /添加公司广告
 */
router.get("/addcompany",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Lb', userinfo.arr);
        res.render("company/addcompany_mng",{
            leftNav:leftNav,
            userinfo: userinfo.adminuserInfo
        })
    }else {
        res.render('login')
    }


})

/*
 /处理添加广告
 */
router.post("/insertcompany",function(req,res){
    var startTime=Date.parse(new Date(req.body.startTime))
    var obj={
        name:req.body.name,
        picUrl:req.body.picUrl,
        startTime:startTime,
        linkPlace:req.body.linkPlace

    }
    var ad = new Company(obj);
    ad.save(function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/admincompany/companylist")
        }
    })
})

/*
 /查询所有广告
 */
router.get("/companylist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('La', userinfo.arr);
        var pagesize = 3;
        var counturl = "/admincompany/getcompanys/1/"+pagesize + '/1';
        var dataurl = "/admincompany/getcompanys/2"+ '/' + pagesize;
        res.render('company/companylist_mng',{

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

router.get("/getcompanys/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Company.count().exec(function(err,docs){
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
            Company.find().skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    var data=new Array
                    for(a in docs){
                        var obj={
                            startTimes:functions.timeFormat(docs[a].startTime*1),
                        }
                        var json = eval('('+(JSON.stringify(docs[a])+JSON.stringify(obj)).replace(/}{/,',')+')');
                        data.push(json)
                    }
                    res.status(200).json(data);
                }
            })
            break;

    }
})

/**
 * 模糊查询
 */
router.get('/searchcompany/:name',function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('La', userinfo.arr);
        var pagesize = 7;
        var name=req.params.name
        var counturl = "/admincompany/companyget/1/"+name+'/'+pagesize + '/1';
        var dataurl = "/admincompany/companyget/2/"+name +'/'+ pagesize;
        res.render('company/companylist_mng',{
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

/**
 * 搜索所有公司广告
 */
router.get("/companyget/:type/:name/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var qs=new RegExp(req.params.name);
    var  obj={
        name:qs
    }
    switch(req.params.type){
        case '1':
            Company.count(obj).exec(function(err,docs){
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
            Company.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
 /删除广告
 */
router.post("/delete",function (req,res) {
    Company.remove({_id:req.body.companyid},function (err,docs) {
        if(err){id
            res.render("nodata")
        }else{
            res.redirect("/admincompany/companylist")
        }
    })
})
/*
 /编辑广告
 */
router.get("/companyinfo/:companyid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Lb', userinfo.arr);
        Company.find({_id:req.params.companyid},function (err,docs) {
            if(err){
                res.render("nodata")
            }else {
                var obj={
                    start:functions.timeFormat(docs[0].startTime*1),
                }

                var json = eval('('+(JSON.stringify(docs[0])+JSON.stringify(obj)).replace(/}{/,',')+')');
                res.render("company/companyinfo_mng",{
                    data:json,
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
/更新公司广告
 */
router.post("/update",function (req,res) {
        var startTime=Date.parse(new Date(req.body.startTime))
        var obj={
            name:req.body.name,
            picUrl:req.body.picUrl,
            startTime:startTime,
            linkPlace:req.body.linkPlace
        }
    Company.update({_id:req.body.companyid},obj,function(err,doce){
        if(err){
            res.render("nodata")
        }else{
            res.redirect('/admincompany/companylist');
        }
    })
})










module.exports = router;