/**
 * Created by 28994 on 2017/5/20.
 */
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Order = mongoose.model("Order");
var User = mongoose.model("User");
var Album = mongoose.model("Album");
var AlbumUser = mongoose.model("AlbumUser");
var Finance = mongoose.model("Finance");
var functions = require("../common/functions");
var config = require("../common/config");
var xml2js = require('xml2js');
var getAccessToken = require("../common/wechat/getAccessToken");

/**
 * 生成会员过期时间
 * @param timeLength    0-5,时长类型
 * @returns {*}
 */
var createExpiresTime = function (timeLength) {
	var time;
	switch (timeLength) {
		case 0:
		case '0':
			time = functions.addMonth(1);
			break;
		case 1:
		case '1':
			time = functions.addMonth(3);
			break;
		case 2:
		case '2':
			time = functions.addMonth(6);
			break;
		case 3:
		case '3':
			time = functions.addMonth(12);
			break;
		case 4:
		case '4':
			time = functions.addMonth(24);
			break;
		case 5:
		case '5':
			time = functions.addMonth(36);
			break;
	}
	return time;
}

/**
 * 支付成功,微信支付的通知接口
 */
router.post('/notify', function (req, res, next) {
	var builder = new xml2js.Builder();  // JSON->xml

	if (req.body.xml.result_code === 'SUCCESS') {
		var orderNo = req.body.xml.out_trade_no;
		var chargetype = (orderNo).substr(0, 1);
		Order.findOne({orderNo: orderNo}, function (err, data) {
			if (data.status == 0) {
				switch (chargetype) {
					case "M":                               //会员充值
						//更新order表
						Order.update({orderNo: orderNo}, {
							status: 1,                              //订单状态,0未付款,1已付款
							payTime: Date.now(),                             //付款时间
						}, function (err1, data1) {
							User.findOne({openId: data.ownerId}, function (e, user) {
								if (user) {
									if (user.vipLevel == data.content.vipLevel) {//如果所有购买的会员级别与现有会员级别相同,则在原有时长上顺延

										//更新user表
										var eTime = createExpiresTime(data.content.timeLength) + user.expireTime - Date.now();

										User.update({openId: data.ownerId}, {
											vipLevel: data.content.vipLevel,
											expireTime: eTime
										}, function (e,v) {
										});
									} else if (user.vipLevel < data.content.vipLevel) {//如果所有购买的会员级别比现有会员级别高


										var eTime = createExpiresTime(data.content.timeLength);
										//更新user表
										User.update({openId: data.ownerId}, {
											vipLevel: data.content.vipLevel,
											expireTime: eTime
										}, function (e, v) {
										});
									}
								}
							});
						});
						break;
					case 'A':                               //相册查看
						var money = (parseInt(req.body.xml.total_fee) / 100 * config.albumIncomeDivideRate).toFixed(2);
						//更新order表
						Order.update({orderNo: orderNo}, {
							status: 1,                              //订单状态,0未付款,1已付款
							payTime: Date.now(),                             //付款时间
						}, function (err1, data1) {

							var albumId = data.content.albumId;
							//更新AlbumUser表
							AlbumUser.update({albumId: albumId, userOpenId: data.ownerId}, {
								albumId: albumId,
								userOpenId: data.ownerId
							}, {upsert: true}, function (e, v) {});
							Album.findOne({_id: mongoose.Types.ObjectId(albumId)}, function (err2, data2) {
								var creatorOpenId = data2.creatorOpenId;
								//更新User表相册所有者的余额信息
								User.update({openId: creatorOpenId}, {$inc: {money: money}}, function (e,v) {});

								//更新finance表
								User.find({openId: {$in: [creatorOpenId, data.ownerId]}}, function (e, users) {
									var creator, viewer;
									for (var i=0;i<users.length;i++) {
										if (users[i].openId == creatorOpenId) {
											creator = users[i];
										} else if (users[i].openId == data.ownerId) {
											viewer = users[i];
										}
									}

									var finance = new Finance({
										openId: creator.openId,                              //用户openId
										nickName: creator.nickName,                            //用户昵称
										avatarUrl: creator.avatarUrl,                           //用户头像
										money: money,                               //金额，单位（元）
										type: 0,                                //类型：0入账，1提现
										content: {
											viewerOpenId: viewer.openId,                    //查看者openId
											viewerNickName: viewer.nickName,                  //查看者昵称
											albumId: data2._id,                         //相册Id
											albumName:data2.albumName,                         //相册名称
										},                                          //内容，仅在type为0时生效。
										createTime: Date.now(),                          //时间
									});
									finance.save(function () {});
									
									var prepayId;
									//给相册所有者发模版消息
									getAccessToken(function(err4, token){
										if(token){
											functions.sendTemplateMessageBuySuccessNotice(prepayId,token,creator.openId,money,viewer.nickName,data2.albumName);
										}
									});
								});
							});
						});
						break;
				}
			}
		});


		//返回数据
		var ret = {
			xml: {
				return_code: 'SUCCESS',
			}
		};
		xml = builder.buildObject(ret);
		res.status(200).end(xml);
	} else {
		//返回数据
		var ret = {
			xml: {
				return_code: 'FAIL ',
				return_msg: req.body.xml.return_msg,
			}
		};
		xml = builder.buildObject(ret);
		res.status(200).end(xml);
	}
}, function (req, res, next) {

});


module.exports = router;