/**
 * 提现信息表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var WithdrawSchema = new mongoose.Schema({
	orderNo:String                  ,            //订单号
	amount:Number,                               //提现金额(元)
	openId:String,                               //提现账户的openid
	nickName:String,                             //提现者昵称
	avatarUrl:String,                            //提现者头像
	isWithdraw:0,                                //是否提现成功1成功0未成功
	approverOpenId:String,                       //审核者openId
	approverNickname:String,                     //审核者昵称
	approverAvatarUrl:String,                    //审核者头像
	createTime:Number,                           //创建时间
	withdrawTime:Number,                         //提现成功时间
});

WithdrawSchema.index({openId : 1,orderNo:-1,iswithdraw:-1,approverOpenId:1,createTime:-1});

mongoose.model('Withdraw', WithdrawSchema);