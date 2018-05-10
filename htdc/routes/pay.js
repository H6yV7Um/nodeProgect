var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var md5 = require("md5");
var fs = require('fs')
var request = require('request')
var functions = require("../common/functions")
var sms = require("../common/sms")
var alipay = require("../common/alipay")
var date = require("../common/date")
var orderstatus = require("../common/orderstatus")
var errors = require("../common/errors")
var config = require("../common/config")
var Officeorder = mongoose.model("Officeorder");
var User = mongoose.model("User");
var Lockauthority = mongoose.model("Lockauthority");
var Withdraw = mongoose.model("Withdraw");
var Finance = mongoose.model("Finance");

/**
 * 充值下订单
 */
router.post("/payorder",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    var finance = new Finance({
        userId:req.body.userid,         //userid
        type:100,           //100充值101提现
        amount:req.body.fee,        //金额(分)
        orderNo:req.body.orderno,                //订单号
        isPaied:0,                //是否支付成功 1成功0未成功
    })
    finance.save(function(err,docs){
        if(err){
            var ret = errors.error3;
            ret.data = err;
            functions.apiReturn(res, ret, req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

/**
 * 微信支付
 */
router.post("/wxpay",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    var userinfo = {
        userid:req.body.userid,
    }
    var WXPay = require('weixin-pay');
    var wxpay = WXPay({
        appid: config.wx.appid,
        mch_id:config.wx.mch_id,
        partner_key: config.wx.partner_key, //微信商户平台API密钥
    });
    wxpay.createUnifiedOrder({
        nonce_str : "Chuang"+Date.now(),
        body : req.body.info,
        out_trade_no : req.body.orderno,
        total_fee : req.body.fee,
        spbill_create_ip : functions.get_client_ip(req),
        notify_url : config.wx.notify_url,
        trade_type : "APP",
        attach:JSON.stringify(userinfo)
    },function(err,re){
        if(err){
            var ret = errors.error3;
            ret.data = err;
            functions.apiReturn(res, ret, req.body._requestId);
        }else{
            if(re.return_code == 'SUCCESS'){
                var obj = {
                    appid:config.wx.appid,
                    partnerid:config.wx.mch_id,
                    prepayid:re.prepay_id,
                    package:'Sign=WXPay',
                    noncestr:re.nonce_str,
                    timestamp:parseInt(Date.now()/1000),
                }
                obj.sign = wxpay.sign(obj)
                var ret = errors.error0;
                ret.data = obj
                functions.apiReturn(res,ret,req.body._requestId);
            }else{
                functions.apiReturn(res,errors.error90000,req.body._requestId);
            }
        }
    })
})
/**
 * 微信支付成功回调
 */
router.post("/wxsuccess",function(req,res){
    //console.log(req)
    var WXPay = require('weixin-pay');
    var wxpay = WXPay({
        appid: config.wx.appid,
        mch_id:config.wx.mch_id,
        partner_key: config.wx.partner_key, //微信商户平台API密钥
    });
    wxpay.useWXCallback(req,res,function(err,data){
        var ordernotype = (data.out_trade_no).substr(0,1);
        switch(ordernotype){
            case 'R':
                var userid = (JSON.parse(data.attach)).userid
                User.update({_id:userid},{'$inc':{'money':data.total_fee,'integral':parseInt((data.total_fee)/1000)}},function(err,users){
                    if(!err){
                        Finance.update({orderNo:data.out_trade_no},{'isPaied':1},function(err,finance){
                            if(!err){
                                res.status(200).end("success");
                            }
                        })
                    }
                })
                break;
            default:
                var userid = (JSON.parse(data.attach)).userid
                User.update({_id:userid},{'$inc':{'integral':parseInt((data.total_fee)/1000)}},function(err,users) {
                    if (!err) {
                        functions.orderstatusChange(data.out_trade_no,'wx',function(err,docs){
                            if(!err){
                                Officeorder.find({orderNo:data.out_trade_no},function(err,order){
                                    if(err){
                                        var ret = errors.error3;
                                        ret.data = err;
                                        res.status(500).json(ret);
                                    }else{
                                        if(order.length > 1){
                                            functions.orderwxoralipayPay(order,'wx',req,res)
                                        }else{
                                            var orders = order[0]
                                            sms.sendNote(orders.interspaceId,orders.type)
                                            //orderno,interspaceid,channel,userid,amount,type,goodsId,goodsName,fn
                                            functions.addFinance(orders.orderNo,orders.interspaceId,'wx',orders.userId,orders.orderAmount,orders.type,orders.orderInfo[0].goodsId,orders.orderInfo[0].goodsName,function(err,data){
                                                if(err){
                                                    var ret = errors.error3;
                                                    ret.data = err;
                                                    res.status(500).json(ret);
                                                }else{
                                                    console.log('***********************************************8')
                                                    switch(orders.type){
                                                        case '1':
                                                            //工位
                                                            var starttime = orders.orderTime;
                                                            var endtime = parseInt(orders.orderTime) + 24*60*60*1000;
                                                            functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                                                if(err){
                                                                    var ret = errors.error3;
                                                                    ret.data = err;
                                                                    res.status(500).json(ret);
                                                                }else{
                                                                    res.status(200).end("success");
                                                                }
                                                            })
                                                            break;
                                                        case '2':
                                                            //会议室
                                                            var arr = functions.sortNumberByKey(orders.orderInfo,'goodsId',-1)
                                                            if(arr.length > 1){
                                                                var timeon = functions.officeTime(arr[0].goodsId)
                                                                var timeend = functions.officeTime(arr[arr.length-1].goodsId)
                                                                var starttime = parseInt(orders.orderTime)+timeon;
                                                                var endtime = parseInt(orders.orderTime) + timeend;
                                                            }else{
                                                                var timeon = functions.officeTime(arr[0].goodsId)
                                                                var timeend = functions.officeTime(arr[0].goodsId + 1)
                                                                var starttime = parseInt(orders.orderTime)+timeon;
                                                                var endtime = parseInt(orders.orderTime) + timeend;
                                                            }
                                                            functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                                                if(err){
                                                                    var ret = errors.error3;
                                                                    ret.data = err;
                                                                    res.status(500).json(ret);
                                                                }else{
                                                                    res.status(200).end("success");
                                                                }
                                                            })
                                                            break;
                                                        case '3':

                                                            //路演厅
                                                            var arr = functions.sortNumberByKey(orders.orderInfo,'goodsId',-1)
                                                            if(arr.length > 1){
                                                                var timeon = functions.roadshowTime(arr[0].goodsId)
                                                                var timeend = functions.roadshowTime(arr[arr.length-1].goodsId)
                                                                var starttime = parseInt(orders.orderTime)+timeon;
                                                                var endtime = parseInt(orders.orderTime) + timeend;
                                                            }else{
                                                                var timeon = functions.roadshowTime(arr[0].goodsId)
                                                                var timeend = functions.roadshowTime(arr[0].goodsId + 1)
                                                                var starttime = parseInt(orders.orderTime)+timeon;
                                                                var endtime = parseInt(orders.orderTime) + timeend;
                                                            }
                                                            functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                                                if(err){
                                                                    var ret = errors.error3;
                                                                    ret.data = err;
                                                                    res.status(500).json(ret);
                                                                }else{
                                                                    res.status(200).end("success");

                                                                }
                                                            })
                                                            break;
                                                        case '4':
                                                            //健身房
                                                            //J15035421871710
                                                            var arr = functions.sortNumberByKey(orders.orderInfo,'goodsId',-1)
                                                            var timeon = functions.gymTime(arr[0].goodsId)
                                                            var timeend = functions.gymTime(arr[arr.length-1].goodsId)
                                                            var starttime = parseInt(orders.orderTime)+timeon;
                                                            var endtime = parseInt(orders.orderTime) + timeend;
                                                            console.log('11111111111111111111111111111111111111111111111111')
                                                            console.log(arr[arr.length-1].goodsId)
                                                            console.log(timeend)
                                                            functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                                                if(err){
                                                                    var ret = errors.error3;
                                                                    ret.data = err;
                                                                    res.status(500).json(ret);
                                                                }else{
                                                                    res.status(200).end("success");

                                                                }
                                                            })
                                                            break;
                                                        default:
                                                            res.status(200).end("success");
                                                            break;
                                                    }
                                                }
                                            })
                                        }


                                    }
                                })
                            }
                        })

                    }
                })

        }
    })
})

/**
 * 钱包支付
 */
router.post("/walletpay",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next()
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    //验证支付密码
    //console.log(req.body.userid)
    User.findOne({_id:req.body.userid},function(err,docs){
        if(err){
            var ret = errors.error3;
            ret.data = err;
            functions.apiReturn(res, ret, req.body._requestId);
        }else{
            var encryptedPw = md5(md5(req.body.password)+docs.paySalt);
            if(encryptedPw == docs.payPassword){
                //支付密码正确，判断用户钱包余额是否够用
                if(docs.money > req.body.money*100){
                    //用户金额减少
                    docs.money -= parseFloat(req.body.money*100)
                    docs.integral += parseInt(req.body.money/10)
                    User.update({_id:req.body.userid},docs,function(err,docs){
                        if(err){
                            var ret = errors.error3;
                            ret.data = err;
                            functions.apiReturn(res, ret, req.body._requestId);
                        }else{
                            next()
                        }
                    })
                }else{
                    functions.apiReturn(res,errors.error10009,req.body._requestId);
                }
            }else{
                functions.apiReturn(res,errors.error10006,req.body._requestId);
            }
        }
    })
},function (req, res, next) {
    //订单状态改变及商品销售量增加
    functions.orderstatusChange(req.body.orderno,'wallet',function(err,docs){
        if(err){
            var ret = errors.error3;
            ret.data = err;
            functions.apiReturn(res, ret, req.body._requestId);
        }else{

            Officeorder.find({orderNo:req.body.orderno},function(err,order){
                if(err){
                    var ret = errors.error3;
                    ret.data = err;
                    functions.apiReturn(res, ret, req.body._requestId);
                }else{
                    if(order.length > 1){
                        functions.orderswalletPay(order,'wallet',req,res)
                    }else{
                        var orders = order[0]
                        sms.sendNote(orders.interspaceId,orders.type)
                        functions.addFinance(orders.orderNo,orders.interspaceId,'wallet',orders.userId,orders.orderAmount,orders.type,orders.orderInfo[0].goodsId,orders.orderInfo[0].goodsName ,function(err,data){
                            if(err){
                                var ret = errors.error3;
                                ret.data = err;
                                functions.apiReturn(res, ret, req.body._requestId);
                            }else{
                                switch(orders.type){
                                    case '1':
                                        //工位
                                        var starttime = orders.orderTime;
                                        var endtime = parseInt(orders.orderTime) + 24*60*60*1000;
                                        functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                            if(err){
                                                var ret1 = errors.error3;
                                                ret1.data = err;
                                                functions.apiReturn(res,ret1,req.body._requestId);
                                            }else{
                                                var ret = errors.error0;
                                                ret.data = {
                                                    orderNo:req.body.orderno
                                                }
                                                functions.apiReturn(res,ret,req.body._requestId);
                                            }
                                        })
                                        break;
                                    case '2':
                                        //会议室
                                        var arr = functions.sortNumberByKey(orders.orderInfo,'goodsId',-1)
                                        if(arr.length > 1){
                                            var timeon = functions.officeTime(arr[0].goodsId)
                                            var timeend = functions.officeTime(arr[arr.length-1].goodsId)
                                            var starttime = parseInt(orders.orderTime)+timeon;
                                            var endtime = parseInt(orders.orderTime) + timeend + 30*60*1000;
                                            functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                                if(err){
                                                    var ret1 = errors.error3;
                                                    ret1.data = err;
                                                    functions.apiReturn(res,ret1,req.body._requestId);
                                                }else{
                                                    var ret = errors.error0;
                                                    ret.data = {
                                                        data:req.body.orderno
                                                    }
                                                    functions.apiReturn(res,ret,req.body._requestId);
                                                }
                                            })
                                        }else{
                                            var timeon = functions.officeTime(arr[0].goodsId)
                                            var timeend = functions.officeTime(arr[0].goodsId)
                                            var starttime = parseInt(orders.orderTime)+timeon;
                                            var endtime = parseInt(orders.orderTime) + timeend + 30*60*1000;
                                            functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                                if(err){
                                                    var ret1 = errors.error3;
                                                    ret1.data = err;
                                                    functions.apiReturn(res,ret1,req.body._requestId);
                                                }else{
                                                    var ret = errors.error0;
                                                    ret.data = {
                                                        data:req.body.orderno
                                                    }
                                                    functions.apiReturn(res,ret,req.body._requestId);
                                                }
                                            })
                                        }

                                        break;
                                    case '3':
                                        //路演厅
                                        var arr = functions.sortNumberByKey(orders.orderInfo,'goodsId',-1)
                                        console.log(arr)
                                        if(arr.length > 1){
                                            var timeon = functions.roadshowTime(arr[0].goodsId)
                                            var timeend = functions.roadshowTime(arr[arr.length-1].goodsId)
                                            var starttime = parseInt(orders.orderTime)+timeon;
                                            var endtime = parseInt(orders.orderTime) + timeend + 30*60*1000;
                                            console.log(starttime+'---'+endtime)
                                            functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                                if(err){
                                                    var ret1 = errors.error3;
                                                    ret1.data = err;
                                                    functions.apiReturn(res,ret1,req.body._requestId);
                                                }else{
                                                    var ret = errors.error0;
                                                    ret.data = {
                                                        data:req.body.orderno
                                                    }
                                                    functions.apiReturn(res,ret,req.body._requestId);
                                                }
                                            })
                                        }else{
                                            var timeon = functions.roadshowTime(arr[0].goodsId)
                                            var timeend = functions.roadshowTime(arr[0].goodsId + 1)
                                            var starttime = parseInt(orders.orderTime)+timeon;
                                            var endtime = parseInt(orders.orderTime) + timeend;
                                            functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                                if(err){
                                                    var ret1 = errors.error3;
                                                    ret1.data = err;
                                                    functions.apiReturn(res,ret1,req.body._requestId);
                                                }else{
                                                    var ret = errors.error0;
                                                    ret.data = {
                                                        data:req.body.orderno
                                                    }
                                                    functions.apiReturn(res,ret,req.body._requestId);
                                                }
                                            })
                                        }

                                        break;
                                    case '4':
                                        //健身房
                                        var arr = functions.sortNumberByKey(orders.orderInfo,'goodsId',-1)
                                        console.log(arr)
                                        var timeon = functions.gymTime(arr[0].goodsId)
                                        var timeend = functions.gymTime(arr[arr.length-1].goodsId)
                                        var starttime = parseInt(orders.orderTime)+timeon;
                                        var endtime = parseInt(orders.orderTime) + timeend;
                                        console.log(orders.goodsId+'1111'+orders.userId+'----'+starttime+'----'+endtime)
                                        functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                            if(err){
                                                var ret1 = errors.error3;
                                                ret1.data = err;
                                                functions.apiReturn(res,ret1,req.body._requestId);
                                            }else{
                                                var ret = errors.error0;
                                                ret.data = {
                                                    data:req.body.orderno
                                                }
                                                functions.apiReturn(res,ret,req.body._requestId);
                                            }
                                        })
                                        break;
                                    default:
                                        var ret = errors.error0;
                                        ret.data = {
                                            data:req.body.orderno
                                        }
                                        functions.apiReturn(res,ret,req.body._requestId);
                                        break;
                                }
                            }
                        })
                    }

                }
            })


        }
    })
})



/**
 * 支付宝支付
 */
router.post("/alipay",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    console.log(req.body)
    var userinfo = {
        userid:req.body.userid,
    }
    var ordernotype = (req.body.orderno).substr(0, 1);
    switch(ordernotype){
        case 'R':
            Finance.findOne({orderNo:req.body.orderno},function(err,orders){
                if(err){
                    var ret = errors.error3;
                    ret.data = err;
                    functions.apiReturn(res, ret, req.body._requestId);
                }else{
                    var data = {
                        subject:req.body.info,
                        out_trade_no:req.body.orderno,
                        total_amount:parseFloat(orders.amount/100).toFixed(2),
                        product_code:'QUICK_MSECURITY_PAY',
                        passback_params:JSON.stringify(userinfo)
                    }
                    var obj = {
                        app_id:config.alipay.app_id,
                        method:'alipay.trade.app.pay',
                        format:'json',
                        charset:'utf-8',
                        sign_type:'RSA',
                        timestamp:date.formatDate(Date.now()),
                        version:'1.0',
                        notify_url:config.alipay.notify_url,
                        biz_content:JSON.stringify(data),
                    }
                    var newdata = alipay.getVerifyParams(obj)
                    var crypto = require('crypto');
                    var sign = crypto.createSign('RSA-SHA1').update(newdata).sign(config.alipay.privateKey, 'base64');
                    for(var i in obj) {
                        if(i != 'timestamp'){
                            obj[i] = encodeURIComponent(obj[i])
                        }
                    }
                    var str = alipay.getVerifyParams(obj)
                    var restr = str+'&sign='+encodeURIComponent(sign)
                    var ret = errors.error0;
                    ret.data = {
                        data:restr
                    }
                    functions.apiReturn(res,ret,req.body._requestId);
                }
            })
            break;
        default:
            Officeorder.findOne({orderNo:req.body.orderno},function(err,orders){
                if(err){
                    var ret = errors.error3;
                    ret.data = err;
                    functions.apiReturn(res, ret, req.body._requestId);
                }else{
                    console.log(orders)
                    var data = {
                        subject:req.body.info,
                        out_trade_no:req.body.orderno,
                        total_amount:req.body.fee * 0.01,
                        product_code:'QUICK_MSECURITY_PAY',
                        passback_params:JSON.stringify(userinfo)
                    }
                    var obj = {
                        app_id:config.alipay.app_id,
                        method:'alipay.trade.app.pay',
                        format:'json',
                        charset:'utf-8',
                        sign_type:'RSA',
                        timestamp:date.formatDate(Date.now()),
                        version:'1.0',
                        notify_url:config.alipay.notify_url,
                        biz_content:JSON.stringify(data),
                    }
                    var newdata = alipay.getVerifyParams(obj)
                    var crypto = require('crypto');
                    var sign = crypto.createSign('RSA-SHA1').update(newdata).sign(config.alipay.privateKey, 'base64');
                    for(var i in obj) {
                        if(i != 'timestamp'){
                            obj[i] = encodeURIComponent(obj[i])
                        }
                    }
                    var str = alipay.getVerifyParams(obj)
                    var restr = str+'&sign='+encodeURIComponent(sign)
                    var ret = errors.error0;
                    ret.data = {
                        data:restr
                    }
                    functions.apiReturn(res,ret,req.body._requestId);
                }
            })
            break;
    }


})

/**
 * 支付宝成功回调
 */
router.post("/alipaysuccess",function(req,res){
    if(req.body.auth_app_id == config.alipay.app_id){
        var ordernotype = (req.body.out_trade_no).substr(0, 1);

        switch(ordernotype){
            case 'R':
                var userid = (JSON.parse(req.body.passback_params)).userid
                User.update({_id:userid},{'$inc':{'money':(req.body.total_amount)*100,'integral':parseInt((req.body.total_amount)/10)}},function(err,users){
                    if(!err){
                        Finance.update({orderNo:req.body.out_trade_no},{'isPaied':1},function(err,finance){
                            if(!err){
                                res.status(200).end("success");
                            }
                        })
                    }
                })
                break;
            default:

                var userid = (JSON.parse(req.body.passback_params)).userid
                User.update({_id:userid},{'$inc':{'integral':parseInt((req.body.total_amount)/10)}},function(err,users) {
                    if (!err) {
                        functions.orderstatusChange(req.body.out_trade_no,'alipay',function(err,docs){
                            if(!err){
                                Officeorder.find({orderNo:req.body.out_trade_no},function(err,order){
                                    if(err){
                                        var ret = errors.error3;
                                        ret.data = err;
                                        res.status(500).json(ret);
                                    }else{
                                        if(order.length > 1){
                                            functions.orderwxoralipayPay(order,'alipay',req,res)
                                        }else{

                                            var orders = order[0]
                                            sms.sendNote(orders.interspaceId,orders.type)
                                            //orderno,interspaceid,channel,userid,amount,type,goodsId,goodsName,fn
                                            functions.addFinance(orders.orderNo,orders.interspaceId,'alipay',orders.userId,orders.orderAmount,orders.type,orders.orderInfo[0].goodsId,orders.orderInfo[0].goodsName,function(err,data){
                                                if(err){
                                                    var ret = errors.error3;
                                                    ret.data = err;
                                                    res.status(500).json(ret);
                                                }else{
                                                    switch(orders.type){
                                                        case '1':
                                                            //工位
                                                            var starttime = orders.orderTime;
                                                            var endtime = parseInt(orders.orderTime) + 24*60*60*1000;
                                                            functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                                                if(err){
                                                                    var ret = errors.error3;
                                                                    ret.data = err;
                                                                    res.status(500).json(ret);
                                                                }else{
                                                                    res.status(200).end("success");
                                                                }
                                                            })
                                                            break;
                                                        case '2':
                                                            //会议室
                                                            var arr = functions.sortNumberByKey(orders.orderInfo,'goodsId',-1)
                                                            if(arr.length > 1){
                                                                var timeon = functions.officeTime(arr[0].goodsId)
                                                                var timeend = functions.officeTime(arr[arr.length-1].goodsId)
                                                                var starttime = parseInt(orders.orderTime)+timeon;
                                                                var endtime = parseInt(orders.orderTime) + timeend + 30*60*1000;
                                                            }else{
                                                                var timeon = functions.officeTime(arr[0].goodsId)
                                                                var starttime = parseInt(orders.orderTime)+timeon;
                                                                var endtime = parseInt(orders.orderTime) + timeon + 30*60*1000;
                                                            }
                                                            functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                                                if(err){
                                                                    var ret = errors.error3;
                                                                    ret.data = err;
                                                                    res.status(500).json(ret);
                                                                }else{
                                                                    res.status(200).end("success");
                                                                }
                                                            })
                                                            break;
                                                        case '3':
                                                            //路演厅
                                                            var arr = functions.sortNumberByKey(orders.orderInfo,'goodsId',-1)
                                                            var timeon = functions.roadshowTime(arr[0].goodsId)
                                                            var timeend = functions.roadshowTime(arr[arr.length-1].goodsId)
                                                            var starttime = parseInt(orders.orderTime)+timeon;
                                                            var endtime = parseInt(orders.orderTime) + timeend + 30*60*1000;
                                                            functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                                                if(err){
                                                                    var ret = errors.error3;
                                                                    ret.data = err;
                                                                    res.status(500).json(ret);
                                                                }else{
                                                                    res.status(200).end("success");

                                                                }
                                                            })
                                                            break;
                                                        case '4':
                                                            //健身房
                                                            var arr = functions.sortNumberByKey(orders.orderInfo,'goodsId',-1)
                                                            var timeon = functions.gymTime(arr[0].goodsId)
                                                            var timeend = functions.gymTime(arr[arr.length-1].goodsId)
                                                            var starttime = parseInt(orders.orderTime)+timeon;
                                                            var endtime = parseInt(orders.orderTime) + timeend;

                                                            functions.addLockAuthority (orders.goodsId,orders.userId,starttime,endtime,orders.orderInfo,function(err,docs){
                                                                if(err){
                                                                    var ret = errors.error3;
                                                                    ret.data = err;
                                                                    res.status(500).json(ret);
                                                                }else{
                                                                    res.status(200).end("success");

                                                                }
                                                            })
                                                            break;
                                                        default:
                                                            res.status(200).end("success");
                                                            break;
                                                    }
                                                }
                                            })
                                        }

                                    }
                                })
                            }
                        })

                    }
                })

        }

    }else{
        var ret = 'appid wrong'
        res.status(500).json(ret);
    }
})

/**
 * 用户提现接口
 */
router.post("/withdraw",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    //验证支付密码
    User.findOne({_id:req.body.userid},function(err,docs){
        if(err){
            var ret = errors.error3;
            ret.data = err;
            functions.apiReturn(res, ret, req.body._requestId);
        }else{
            var encryptedPw = md5(md5(req.body.password)+docs.paySalt);
            if(encryptedPw == docs.payPassword){
                //支付密码正确
                //Withdraw
                if((req.body.money < docs.money) || (req.body.money == docs.money) ){
                    var obj = new Withdraw({
                        userId:req.body.userid,            //userid
                        type:101,
                        orderNo:"T"+Date.now()+functions.createVercode(4),            //订单号
                        amount:req.body.money,        //提现金额
                        openid:req.body.openid,            //提现账户的openid
                        createTime:Date.now(),         //提现时间
                        iswithdraw:0,        //是否提现成功1成功0未成功
                    })
                    obj.save(function(err,docs){
                        if(err){
                            console.log(err)
                            var ret = errors.error3;
                            ret.data = err;
                            functions.apiReturn(res, ret, req.body._requestId);
                        }else{
                            var fee = parseInt(req.body.money)
                            User.update({_id:req.body.userid},{'$inc':{'money':-fee}},function(err,userinfo){
                                if(err){
                                    var ret = errors.error3;
                                    ret.data = err;
                                    functions.apiReturn(res, ret, req.body._requestId);
                                }else{
                                    var ret = errors.error0;
                                    ret.data = docs;
                                    functions.apiReturn(res,ret,req.params._requestId);
                                }
                            })

                        }
                    })
                }else{
                    //提现金额大于已有金额
                    functions.apiReturn(res,errors.error10014,req.body._requestId);
                }

            }else{
                //支付密码错误
                functions.apiReturn(res,errors.error10006,req.body._requestId);
            }
        }
    })
})

/**
 * 提现
 */
router.post("/gowithdraw",function(req,res,next){
    var WXPay = require('weixin-pay');
    var wxpay = WXPay({
        appid: config.wx.appid,
        mch_id:config.wx.mch_id,
        partner_key: config.wx.partner_key, //微信商户平台API密钥
        pfx: fs.readFileSync('./wxpay_cert.p12'),
    });
    var obj = {
        mch_appid:config.wx.appid,
        mchid:config.wx.mch_id,
        nonce_str:"Chuang"+Date.now(),//随机字符串
        partner_trade_no:req.body.orderno,//订单号
        openid:req.body.openid,//用户openid
        check_name:'NO_CHECK',
        amount:parseInt(req.body.fee), //金额
        desc:'创程提现',  //企业付款操作说明信息
        spbill_create_ip:functions.get_client_ip(req),
    }
    var sign = wxpay.sign(obj)
    obj.sign = sign
    wxpay.payment(obj,function(err,docs){
        console.log(docs)
        if(docs.err_code == 'NOTENOUGH'){
            //商户余额不足
            res.status(200).json({
                code:'60001',
                mesg:'微信商户余额不足'
            });
        }else{
            if(docs.result_code == 'FAIL'){
                res.status(200).json({
                    code:'60002',
                    mesg:docs.err_code_des
                });
            }else{
                Withdraw.update({orderNo:docs.partner_trade_no},{'iswithdraw':1,'withdrawTime':Date.now()},function(err,docs){
                    if(err){
                        res.status(200).json({
                            code:'3',
                            mesg:'数据库操作错误'
                        });
                    }else{
                        res.status(200).json({
                            code:'0',
                            mesg:'提现成功'
                        });

                    }
                })
            }
        }
    })
})

/**
 * 退单
 */
router.post("/refund",function(req,res){
    console.log(req.body)
    Officeorder.findOne({_id:req.body.orderid},function(err,order){
        if(err){
            res.render('nodata')
        }else{
            console.log(order)
            if(order.orderAmount > 0){
                switch(order.paytype){
                    case 'wx':
                        var fs = require('fs')
                        var WXPay = require('weixin-pay');
                        var wxpay = WXPay({
                            appid: config.wx.appid,
                            mch_id:config.wx.mch_id,
                            partner_key: config.wx.partner_key, //微信商户平台API密钥
                            pfx: fs.readFileSync('./wxpay_cert.p12'),
                        });
                        var data = {
                            out_trade_no:order.orderNo, //订单号
                            out_refund_no:'CC'+parseInt(Date.now()/10000)+functions.createVercode(4),
                            total_fee:order.orderAmount*100,   //订单金额
                            refund_fee:order.orderAmount*100,   //退款金额
                        }
                        if(order.type == 3){
                            data.refund_fee = (order.orderAmount - order.deposit)*100
                        }
                        console.log(data)
                        wxpay.refund(data,function(err,data){
                            if(err){

                            }else{
                                console.log(data)
                                var finance = new Finance({
                                    userId:order.userId,         //userid
                                    interspaceId:order.interspaceId,    //空间id
                                    type:'300',           //100充值101提现200路演听押金退还
                                    amount:(data.refund_fee)*100,        //金额(分)
                                    orderNo:order.orderNo,                //订单号
                                    channel:'wallet',                //充值方式
                                    goodsId:order.goodsId,
                                    goodsName:order.orderInfo[0].goodsName,
                                    //coffeeShopId:String,          //咖啡分店id
                                    isPaied:1,                //是否支付成功 1成功0未成功
                                    createTime:Date.now(),             //时间
                                })
                                finance.save(function(err,finance){
                                    if(err){

                                    }else{
                                        Officeorder.update({_id:req.body.orderid},{orderStatus:orderstatus.statusM10002},function(err,orderstatus){
                                            if(err){

                                            }else{
                                                Lockauthority.remove({roomId:order.goodsId,userId:order.userId},function(err,lock){
                                                    if(err){

                                                    }else{
                                                        res.status(200).json({
                                                            status:1
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                        break;
                    case 'wallet':
                        var fee = order.orderAmount
                        if(order.type == 3){
                            fee = order.orderAmount - order.deposit
                        }
                        User.update({_id:req.body.userid},{$inc:{money:fee}},function(err,userinfo){
                            if(err){

                            }else{
                                var finance = new Finance({
                                    userId:order.userId,         //userid
                                    interspaceId:order.interspaceId,    //空间id
                                    type:'300',           //100充值101提现200路演听押金退还
                                    amount:(fee)*100,        //金额(分)
                                    orderNo:order.orderNo,                //订单号
                                    channel:'wallet',                //充值方式
                                    goodsId:order.goodsId,
                                    goodsName:order.orderInfo[0].goodsName,
                                    //coffeeShopId:String,          //咖啡分店id
                                    isPaied:1,                //是否支付成功 1成功0未成功
                                    createTime:Date.now(),             //时间
                                })
                                finance.save(function(err,finance){
                                    if(err){

                                    }else{
                                        Officeorder.update({_id:req.body.orderid},{orderStatus:orderstatus.statusM10002},function(err,orderstatus){
                                            if(err){

                                            }else{
                                                Lockauthority.remove({roomId:order.goodsId,userId:order.userId},function(err,lock){
                                                    if(err){

                                                    }else{
                                                        res.status(200).json({
                                                            status:1
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                        break;
                    case 'alipay':
                        console.log('1111111111111111111')
                        var data = {
                            out_trade_no:order.orderNo,
                            refund_amount:order.orderAmount,
                            refund_reason:'正常退款',
                        }
                        if(order.type == 3){
                            data.refund_amount = order.orderAmount - order.deposit
                        }
                        var obj = {
                            app_id:config.alipay.app_id,
                            method:'alipay.trade.refund',
                            format:'JSON',
                            charset:'utf-8',
                            sign_type:'RSA',
                            timestamp:date.formatDate(Date.now()),
                            version:'1.0',
                            biz_content:JSON.stringify(data),
                        }
                        var cc=JSON.stringify(data)
                        var newdata = alipay.getVerifyParams(obj)
                        var crypto = require('crypto');
                        var sign = crypto.createSign('RSA-SHA1').update(newdata).sign(config.alipay.privateKey, 'base64');
                        var url1 = 'https://openapi.alipay.com/gateway.do?timestamp='+obj.timestamp+'&method='+encodeURIComponent('alipay.trade.refund')+'&app_id='+encodeURIComponent(obj.app_id)+'&sign_type=RSA&sign='+encodeURIComponent(sign)+'&version='+encodeURIComponent('1.0')+'&biz_content='+encodeURIComponent(cc)+'&charset='+encodeURIComponent('utf-8')+'&format=JSON';
                        request(url1,function (error, response, body) {
                            if(error){
                                console.log(error)
                            }else {
                                console.log(JSON.parse(body))
                                //"result":"000000"
                                var result = JSON.parse(body)
                                if(result.alipay_trade_refund_response.msg == 'Success'){
                                    var finance = new Finance({
                                        userId:order.userId,         //userid
                                        interspaceId:order.interspaceId,    //空间id
                                        type:'300',           //100充值101提现200路演听押金退还
                                        amount:(data.refund_amount)*100,        //金额(分)
                                        orderNo:order.orderNo,                //订单号
                                        channel:'alipay',                //充值方式
                                        goodsId:order.goodsId,
                                        goodsName:order.orderInfo[0].goodsName,
                                        //coffeeShopId:String,          //咖啡分店id
                                        isPaied:1,                //是否支付成功 1成功0未成功
                                        createTime:Date.now(),             //时间
                                    })
                                    finance.save(function(err,finance){
                                        if(err){

                                        }else{
                                            console.log(finance)
                                            Officeorder.update({_id:req.body.orderid},{orderStatus:orderstatus.statusM10002},function(err,orderstatus){
                                                if(err){

                                                }else{
                                                    console.log(orderstatus)
                                                    Lockauthority.remove({roomId:order.goodsId,userId:order.userId},function(err,lock){
                                                        if(err){

                                                        }else{
                                                            console.log(lock)
                                                            res.status(200).json({
                                                                status:1
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })

                                }
                            }
                        })
                        break;
                }
            }else{
                Officeorder.update({_id:req.body.orderid},{orderStatus:orderstatus.statusM10002},function(err,orderstatus) {
                    if (err) {

                    } else {
                        res.status(200).json({
                            status:1
                        })
                    }
                })

            }


        }
    })

})
module.exports = router;