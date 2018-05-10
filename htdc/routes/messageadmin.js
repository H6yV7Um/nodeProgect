var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var cache = require("memory-cache");
var md5 = require("md5");
var Txysig = require("../common/txysign");
var functions = require("../common/functions");
var orderstatus = require("../common/orderstatus");
var config = require("../common/config");
var sms = require("../common/sms");
var errors = require("../common/errors");
var Message = mongoose.model("Message");

/**
 * 资讯列表
 */
router.get('/messagelist',function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('La', userinfo.arr);
        var pagesize = 7;
        var counturl = "/messageadmin/getallmessage/1/"+pagesize + '/1';
        var dataurl = "/messageadmin/getallmessage/2/" + pagesize;
        res.render('messageadmin/messagelist_mng',{
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
 * 查询所有资讯
 */
router.get("/getallmessage/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Message.count({}).exec(function(err,docs){
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
                Message.find({}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
 * 添加资讯
 */
router.get("/addmessage",function(req,res){
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('La', userinfo.arr);
        res.render('messageadmin/addmessage_mng', {
            leftNav: leftNav,
            userinfo: userinfo.adminuserInfo
        });
    } else {
        res.render('login')
    }
})

/**
 * 添加资讯（数据库操作）
 */
router.post("/insertmessage",function(req,res){
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var message = new Message(req.body)
        message.save(function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.redirect("/messageadmin/messagelist")
            }
        })
    } else {
        res.render('login')
    }

})

/**
 * 删除资讯
 */
router.post("/delete",function(req,res){
    //messageid
    var userinfo = req.session.adminuser;
    if (userinfo) {
        Message.remove({_id:req.body.messageid},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.redirect("/messageadmin/messagelist")
            }
        })
    } else {
        res.render('login')
    }
})
module.exports = router;