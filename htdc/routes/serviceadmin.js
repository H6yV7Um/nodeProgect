var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var sms = require("../common/sms")
var orderstatus = require("../common/orderstatus")
var errors = require("../common/errors");
var mongoose = require("mongoose");
var Serviceclass = mongoose.model("Serviceclass");
var Service = mongoose.model("Service");

router.get("/serviceclass",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ca', userinfo.arr);
        var interspaceid = userinfo.adminuserInfo.interspaceId;
        Serviceclass.find({interspaceId:interspaceid},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.render('service/serviceclass_mng',{
                    leftNav:leftNav,
                    data:docs,
                    userinfo: userinfo.adminuserInfo
                });
            }
        })
    }else {
        res.render('login')
    }

})

/**
 * 服务的公司列表
 */
router.get("/businesslist/:serviceid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var userinfo = req.session.adminuser;
        if(userinfo) {
            var leftNav = functions.createLeftNavByCodes('Ca', userinfo.arr);
            var pagesize = 7;
            var counturl = "/serviceadmin/getbuciness/1/"+req.params.serviceid+'/'+pagesize + '/1';
            var dataurl = "/serviceadmin/getbuciness/2/" +req.params.serviceid+'/'+ pagesize;
            res.render('service/businesslist_mng',{
                leftNav:leftNav,
                pagesize : pagesize,
                counturl:counturl,
                dataurl:dataurl,
                userinfo: userinfo.adminuserInfo
            });
        }else {
            res.render('login')
        }
    }else {
        res.render('login')
    }
})

/**
 * 查询服务公司
 */
router.get("/getbuciness/:type/:serviceid/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    if(userinfo) {
        switch(req.params.type){
            case '1':
                Service.count({serviceClassId:req.params.serviceid}).exec(function(err,docs){
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
                Service.find({serviceClassId:req.params.serviceid}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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

/**
 * 编辑服务公司
 */
router.get("/updateservice/:businessid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ca', userinfo.arr);
        Service.find({_id:req.params.businessid},function(err,data){
            res.render("service/businessinfo_mng",{
                leftNav:leftNav,
                data:data[0],
                userinfo: userinfo.adminuserInfo
            })
        })

    }else {
        res.render('login')
    }
})
module.exports = router;