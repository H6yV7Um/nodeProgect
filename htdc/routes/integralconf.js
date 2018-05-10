var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var functions = require("../common/functions");
var config = require("../common/config");
var errors = require("../common/errors");
var Integralconf = mongoose.model("Integralconf");

/**
 * 积分获取方式
 */
router.get("/integralinfo",function(req,res){
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('Na', userinfo.arr);
        Integralconf.find({},function(err,conf){
            if(err){
                res.render('nodata')
            }else{
                res.render('integralconf/integralconf_mng', {
                    leftNav: leftNav,
                    userinfo: userinfo.adminuserInfo,
                    data:conf[0]
                });
            }
        })
    } else {
        res.render('login')
    }
})


/**
 * 修改积分内容
 */
router.post("/updateintegral",function(req,res){
   res.send(req.body)
})



router.get("/",function(req,res){
    // var arr = [
    //     {type:'首次注册成功创程APP',fee:50},
    //     {type:'任意消费',fee:10},
    //     {type:'每日签到',fee:5},
    // ]
    // var obj = new Integralconf({
    //     getIntegralWay:arr,     //积分获取方式
    //     integralFee:100,       //积分兑换金额1元=？积分
    // })
    // obj.save(function(err,docs){
    //     res.send(docs)
    // })
})
module.exports = router;