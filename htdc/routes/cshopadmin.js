var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var mongoose = require("mongoose");
var Cshop = mongoose.model("Cshop");


/*
 /添加咖啡店
 */
router.get("/addcshop",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Oc', userinfo.arr);
        res.render("cshop/addcshop_mng",{
            leftNav:leftNav,
            userinfo: userinfo.adminuserInfo
        })
    }else {
        res.render('login')
    }
})

/*
 /处理添加咖啡店
 */
router.post("/insertcshop",function(req,res){
    console.log(req.body)
    var ad = new Cshop(req.body);
    ad.save(function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/cshopadmin/cshoplist")
        }
    })
})

/*
 /查询所有咖啡店
 */
router.get("/cshoplist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var pagesize = 3;
        var leftNav = functions.createLeftNavByCodes('Oc', userinfo.arr);
        var counturl = "/cshopadmin/getcshops/1/"+pagesize + '/1';
        var dataurl = "/cshopadmin/getcshops/2"+ '/' + pagesize;
        res.render('cshop/cshoplist_mng',{
            userinfo: userinfo.adminuserInfo,
            leftNav:leftNav,
            pagesize : pagesize,
            counturl:counturl,
            dataurl:dataurl
        });
    }else {
        res.render('login')
    }
})

router.get("/getcshops/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Cshop.count().exec(function(err,docs){
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
            Cshop.find().skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
 /删除咖啡店
 */
router.post("/delete",function (req,res) {
    Cshop.remove({_id:req.body.cshopid},function (err,docs) {
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/cshopadmin/cshoplist")
        }
    })
})
/*
 /编辑咖啡店
 */
router.get("/cshopinfo/:cshopid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ob', userinfo.arr);
        Cshop.find({_id:req.params.cshopid},function (err,docs) {
            if(err){
                res.render("nodata")
            }else {
                res.render('cshop/cshopinfo_mng',{
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
 /更新咖啡店
 */
router.post("/update",function (req,res) {
    var obj = {
        picUrl:req.body.picUrl,
        linkPlace:req.body.linkPlace
    }
    Cshop.update({_id:req.body.cshopid},obj,function(err,doce){
        if(err){
            res.render("nodata")
        }else{
            res.redirect('/cshopadmin/cshoplist');
        }
    })
})

module.exports = router;