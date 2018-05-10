var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Admin = mongoose.model("Admin");
var Withdraw = mongoose.model("Withdraw");
var Feedback = mongoose.model("Feedback");
var Finance = mongoose.model("Finance");
var fs = require("fs");
var redisClient = require("../common/redisClient");
var functions = require("../common/functions");
var config = require("../common/config");
var errors = require("../common/errors");
var WXPay = require('weixin-pay');

/**
 * 微信小程序端查看自己是否是管理员
 * */
router.get('/wx_checkadmin/:openId', function (req, res, next) {
	var openId = req.params.openId;
	Admin.count({openId:openId},function (e,v) {
		if(e){
			res.status(200).json(errors.error3);
		}else{
			if (v > 0){//有管理权限
				res.status(200).json(errors.error0);
			}else{//没有管理权限
				res.status(200).json(errors.error8);
			}
		}
	})
});

/**
 * 查看用户提现申请列表
 * 参数:page,页码从1开始
 */
router.get("/withdrawlist/:openId/:page",function (req, res, next) {
	var page = req.params.page;     //页面编码从1开始
	var openId = req.params.openId;
	Admin.count({openId:openId},function (e,v) {
		if(e){
			res.status(200).json(errors.error3);
		}else{
			if (v > 0){//有管理权限
				next();
			}else{//没有管理权限
				res.status(200).json(errors.error8);
			}
		}
	})
},function (req, res, next) {
	var page = req.params.page;     //页面编码从1开始

	var start = (parseInt(page) - 1) * 10;
	Withdraw.find({}).sort({isWithdraw:1,createTime:-1}).skip(start).limit(10).exec(function(err,docs){
		if (err){
			res.status(200).json(errors.error3);
		}else{
			res.status(200).json({
				error:0,
				message:"success",
				data:docs,
			});
		}
	})
});


/**
 * 用户执行提现
 */
router.post("/dowithdraw" ,function (req,res, next) {
	var orderNo = req.body.orderNo;                 //订单号
	var openId = req.body.openId;                   //提现者的openId
	var approverOpenId = req.$wxUserInfo.openId;



	Admin.count({openId:approverOpenId},function (e,v) {                //先判断有无权限
		if(e){
			res.status(200).json(errors.error3);
		}else{
			if (v > 0){//有管理权限
				req.body.fee = v.amount;
				next();
			}else{//没有管理权限
				res.status(200).json(errors.error8);
			}
		}
	})
},function (req, res, next) {
	var orderNo = req.body.orderNo;
	var openId = req.body.openId;
	var approverOpenId = req.$wxUserInfo.openId;
	var approverNickName = req.$wxUserInfo.nickName;
	var approverAvatarUrl = req.$wxUserInfo.avatarUrl;


	Withdraw.findOne({orderNo:orderNo},function (e, data) {
		if(!e && data){
			if(data.isWithdraw == 0){                       //此订单未提现
				var wxpay = WXPay({
					appid: config.weappConfig.appId,
					mch_id: config.weappConfig.mchId,
					partner_key: config.weappConfig.wxPayKey, //微信商户平台API密钥
					pfx: fs.readFileSync(config.weappConfig.certFile), //微信商户平台证书
				});
				var obj = {
					mch_appid:config.weappConfig.appId,
					mchid:config.weappConfig.mchId,
					nonce_str:Date.now()+functions.randomnum(4),//随机字符串
					partner_trade_no:orderNo,//订单号
					openid:openId,//用户openid
					check_name:'NO_CHECK',
					amount:data.amount * 100, //金额
					desc:config.appName + '提现',  //企业付款操作说明信息
					spbill_create_ip:req.ip,
				}
				var sign = wxpay.sign(obj)
				obj.sign = sign
				wxpay.payment(obj,function(err,docs){
					if(docs.err_code == 'NOTENOUGH'){
						//商户余额不足
						res.status(200).json(errors.error10);
					}else{
						if(docs.result_code == 'FAIL'){
							res.status(200).json(errors.error11);
						}else{

							//更新提现表
							Withdraw.update({orderNo:docs.partner_trade_no},{
								isWithdraw:1,
								approverOpenId:approverOpenId,                       //审核者openId
								approverNickname:approverNickName,                     //审核者昵称
								approverAvatarUrl:approverAvatarUrl,                    //审核者头像
								withdrawTime:Date.now()
							},function(err1,docs1){
								if(err1){
									res.status(200).json(errors.error3);
								}else{
									//更新财务表
									var finance = new Finance({
										openId:openId,                              //用户openId
										nickName:'',                            //用户昵称
										avatarUrl:'',                           //用户头像
										money:data.amount,                               //金额，单位（元）
										type:1,                                //类型：0入账，1提现
										content:{},                                          //内容，仅在type为0时生效。
										createTime:Date.now(),                          //时间
									});
									finance.save(function (err2, docs2) {
										if(err2){
											res.status(200).json(errors.error3);
										}else{
											res.status(200).json(errors.error0);
										}
									});
								}
							})
						}
					}
				})
			}else{                      //此订单已提现
				res.status(200).json(errors.error13);
			}
		}else{
			res.status(200).json(errors.error3);
		}
	})
});


module.exports = router;
