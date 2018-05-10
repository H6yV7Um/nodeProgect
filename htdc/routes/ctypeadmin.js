var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var mongoose = require("mongoose");
var Ctype = mongoose.model("Ctype");
var Link = mongoose.model("Link");

/*
 /联系方式
 */
router.get("/contactway",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Oi', userinfo.arr);
        var interspacesid = userinfo.adminuserInfo.interspaceId
        Link.find({interspaceId:interspacesid,serviceType:'5'},function(err,link) {
            if (err) {
                res.render("nodata")
            } else {
                if(link.length > 0){
                    res.render('ctype/contactway_mng', {
                        leftNav: leftNav,
                        userinfo: userinfo.adminuserInfo,
                        phone:link[0].linkPhone
                    });
                }else{
                    res.render('ctype/contactway_mng', {
                        leftNav: leftNav,
                        userinfo: userinfo.adminuserInfo,
                        phone:''
                    });
                }

            }
        })

    }else {
        res.render('login')
    }
})

/**
 * 修改联系方式
 */
router.post("/updatelink",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        Link.find({interspaceId:interspacesid,serviceType:5},function(err,link){
            if(err){
                res.render("nodata")
            }else{
                if(link.length > 0){
                    Link.update({interspaceId:interspacesid,serviceType:5},{linkPhone:req.body.phone},function(err,linkinfo){
                        if(err){
                            res.render("nodata")
                        }else{
                            res.redirect("/ctypeadmin/contactway")
                        }
                    })
                }else{
                    var json = new Link({
                        interspaceId:interspacesid,   //空间id
                        linkPhone:req.body.phone,     //联系电话
                        serviceType:5,   //服务类型
                    })
                    json.save(function(err,newlink){
                        if(err){
                            res.render("nodata")
                        }else{
                            res.redirect("/ctypeadmin/contactway")
                        }
                    })
                }
            }
        })

    }else{
        res.render('login')
    }

})

/*
 /添加咖啡店类型
 */
router.get("/addctype",function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ob', userinfo.arr);
        Ctype.find({}, function (err, docs) {
            if (err) {
                res.render("nodata")
            } else {
                res.render('ctype/addctype_mng', {
                    leftNav: leftNav,
                    userinfo: userinfo.adminuserInfo
                });
            }
        })
    }else {
        res.render('login')
    }
})

/*
 /处理添加类型
 */
router.post("/insertctype",function(req,res){
    console.log(req.body)
    var ad = new Ctype(req.body);
    ad.save(function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/ctypeadmin/ctypelist")
        }
    })
})

/*
 /查询所有类型
 */
router.get("/ctypelist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var pagesize=3
        var leftNav = functions.createLeftNavByCodes('Oa', userinfo.arr);
        var counturl = "/ctypeadmin/getctypes/1/"+pagesize + '/1';
        var dataurl = "/ctypeadmin/getctypes/2"+ '/' + pagesize;
        res.render('ctype/ctypelist_mng',{
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

router.get("/getctypes/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Ctype.count().exec(function(err,docs){
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
            Ctype.find().skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
 /删除类型
 */
router.post("/delete",function (req,res) {
    Ctype.remove({_id:req.body.ctypeid},function (err,docs) {
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/ctypeadmin/ctypelist")
        }
    })
})
/*
 /编辑类型
 */
router.get("/ctypeinfo/:ctypeid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Oa', userinfo.arr);
        Ctype.find({_id:req.params.ctypeid},function (err,docs) {
            if(err){
                res.render("nodata")
            }else {
                res.render('ctype/ctypeinfo_mng',{
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
 /更新类型
 */
router.post("/update",function (req,res) {
    var obj = {
        name:req.body.name,
    }
    Ctype.update({_id:req.body.ctypeid},obj,function(err,doce){
        if(err){
            res.render("nodata")
        }else{
            res.redirect('/ctypeadmin/ctypelist');
        }
    })
})

module.exports = router;