var express = require('express');
var router = express.Router();
var request = require('request');
var config = require("../common/config");
var errors = require("../common/errors");
var shouquan = require("../common/shouquan");
var date = require("../common/date");
var mongoose = require("mongoose");
var md5 = require('md5');
var Adminuser = mongoose.model("Adminuser");
var Ticket = mongoose.model("Ticket");
var WXPay = require('weixin-pay');
var functions = require("../common/functions")
var Payment = require('wechat-pay').Payment;
const Alipay = require('alipay-mobile')
var fs = require('fs');
var path = require("path");


/* GET home page. */
router.get('/', function (req, res, next) {
    var ua = req.headers['user-agent']
    if (ua.indexOf('MicroMessenger') != -1) {
        if (ua.match(/MicroMessenger/)[0] == 'MicroMessenger') {
            req.session.type = 'WeiXIN'
            res.render("index", {title: '康陪', type: 'WeiXIN'})
        }
    } else if (ua.indexOf('AlipayClient') != -1) {
        if (ua.match(/AlipayClient/)[0] == 'AlipayClient') {
            // return "Alipay";
            req.session.type = 'Alipay'
            res.render("index", {title: '康陪', type: 'Alipay'})
        }
    } else {

        res.render("index", {title: '康陪'})
    }
});

/*支付宝支付*/
router.post('/pay',function (req,res,next) {
    if(req.session.type == 'Alipay'){
    Ticket.findOne({isSale:0},function (err,doc) {
        if(err){
            res.status(200).json(errors.error3)
        }else {
            if(doc){
                var time = functions.timeFormat(Date.now())
                var orderNo = 'XZG' + time + doc.channel + doc.ticketType + doc.ticketNo + Date.now();

                const read = filename => {
                    return fs.readFileSync(path.resolve(__dirname, filename))
                }

//app_id: 开放平台 appid
//appPrivKeyFile: 你的应用私钥
//alipayPubKeyFile: 蚂蚁金服公钥
                const options = {
                    app_id: config.alipay.app_id,
                    appPrivKeyFile: read('./key/rsa_private_key.pem'),
                    alipayPubKeyFile: read('./key/alipay_public_key.pem')
                }
                const service = new Alipay(options)

                var data={
                    subject:'2018“型”中国电子音乐节健美健身大奖赛门票',
                    out_trade_no:orderNo,
                    total_amount:parseFloat(doc.price).toFixed(2),
                    // total_amount:0.01,
                    product_code:'QUICK_MSECURITY_PAY',
                    // passback_params:JSON.stringify(userinfo)
                }
                const basicParams = {
                    notify_url: 'http://kp.mengotech.com/alipaysuccess'
                }
                return service.createWebOrderURL(data, basicParams)
                    .then(result => {
                        res.json(result)
                    })
            }else {
                res.json(errors.error20002)
            }


        }
    })
    }

})

/**
 * 支付宝成功回调
 */
router.post("/alipaysuccess",function(req,res) {
    if (req.body.auth_app_id == config.alipay.app_id) {
        console.log(req.body)
        Ticket.findOne({isSale:0},function (err,doc) {
            if(err){
                res.status(200).json(errors.error3)
            }else {
                console.log(doc)

                var obj={
                    isSale:1,
                    orderNo:req.body.out_trade_no,
                    way:'Alipay',
                    saleTime:Date.now()
                }
                Ticket.update({_id:doc._id},obj,function (err,docs) {
                    if(err){
                        res.status(200).json(errors.error3)
                    }else {
                        console.log('@@@@@@@@@@@@@@@@@@')
                        res.json(docs)
                    }
                })

            }
        })
    }
})



/**
 * 微信支付
 */
router.post('/wxpay', function (req, res, next) {
    console.log('##########################')
    var code = req.body.accessCode
    Ticket.findOne({isSale:0},function(err,doc){
        if(err){
            res.json(errors.error3)
        }else {
            request('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.weappConfigTest.appId + '&secret=' + config.weappConfigTest.appSecret + '&code=' + code + '&grant_type=authorization_code', function (err, res1, body) {
                var openid = JSON.parse(body).openid
                console.log(body)
                console.log(openid)
                var wxpay = WXPay({
                    appid: config.weappConfigTest.appId,
                    mch_id: config.weappConfigTest.mchId,
                    partner_key: config.weappConfigTest.wxPayKey, //微信商户平台API密钥
                });
                var time = functions.timeFormat(Date.now())
                var orderNo = 'XZG' + time + doc.channel + doc.ticketType + doc.ticketNo + Date.now();
                wxpay.createUnifiedOrder({
                    nonce_str:functions.createVercodeNumAndLetter(),
                    body: 'chong',
                    out_trade_no: orderNo,
                    total_fee: 1,
                    spbill_create_ip: '115.159.161.183',
                    notify_url: 'kp.mengotech.com/1.0/pay/wxsuccess',
                    trade_type: "JSAPI",
                    openid: openid

                }, function (err, re) {
                    if (err) {
                        var ret = errors.error3;
                        ret.data = err;
                    } else {
                        console.log(re)
                        if (re.return_code == 'SUCCESS') {
                            console.log('sssss')
                            console.log(re)
                            var obj = {
                                appId: config.weappConfigTest.appId,
                                timeStamp: parseInt(Date.now() / 1000)+'',
                                nonceStr: re.nonce_str,
                                package: 'prepay_id='+ re.prepay_id,
                                signType:'MD5',

                            }
                            obj.paySign = wxpay.sign(obj)
                            var ret = errors.error0;
                            ret.data = obj
                            console.log(ret)
                            res.json(ret)

                            //WeixinJSBridge.invoke(
                            //    'getBrandWCPayRequest', {
                            //        appId: config.weappConfigTest.appId,
                            //        timeStamp: obj.timestamp,
                            //        nonceStr: obj.noncestr,
                            //        package: obj.prepayid,
                            //        signType: 'MD5',
                            //        paySign: obj.sign,
                            //    },
                            //    function (res) {
                            //        console.log('666')
                            //        if (res.err_msg == "get_brand_wcpay_request:ok") {
                            //        }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                            //    }
                            //);

                        } else {
                            console.log(err)
                        }
                    }

                })
            })
        }
    })


});
/**
 * 微信支付成功回调
 */
router.post("/wxsuccess", function (req, res) {
    //console.log(req)
    var WXPay = require('weixin-pay');
    var wxpay = WXPay({
        appid: config.weappConfigTest.appid,
        mch_id: config.weappConfigTest.mch_id,
        partner_key: config.weappConfigTest.wxPayKey, //微信商户平台API密钥
    });
    wxpay.useWXCallback(req, res, function (err, data) {
        console.log('回调')

    })
})


/*登录页面*/
router.get('/login', function (req, res, next) {

    var user = req.session.user;
    if (user) {
        res.redirect('/admin')
    } else {
        res.render("login", {title: '康陪'})
    }

})
/*登录验证*/
router.post('/login_ajax', function (req, res, next) {
    var account = req.body.account;
    var password = req.body.password;
    Adminuser.findOne({account: account}).exec(function (err, doc) {
        if (err) {
            res.status(200).json(errors.error3);
        } else {
            if (doc) {
                var encryptedPw = md5(md5(password) + config.userSalt);
                if (encryptedPw == doc.password) {
                    req.session.user = {
                        userInfo: doc
                    };
                    console.log(req.session.user)
                    res.status(200).json(errors.error0);
                } else {
                    res.status(200).json(errors.error60003);
                }
            } else {
                res.status(200).json(errors.error60002);
            }
        }
    })
})


module.exports = router;
