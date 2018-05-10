/**
 * 用户信息表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var UserSchema = new mongoose.Schema({
	nickName:String,                                //姓名
	gender:Number,                                  //性别
	language:String,                                //语言
	city:String,                                    //城市
	province:String,                                //省
	country:String,                                 //国家
	avatarUrl:String,                               //头像
	openId:String,                                  //openid
	changeCheckCode:String,                         //个人信息变更校验码,用于校验微信上的个人信息有无变更.
	money:Number,                                   //我的零钱（元）
	vipLevel:Number,                                //会员等级.0普通会员;1银牌会员;2金牌会员;3钻石会员
	expireTime:Number,                              //会员到期时间，如果是普通会员则为0.其他会员为Linux时间戳（毫秒制）
	createTime:Number,                              //创建时间
});

UserSchema.index({openId : 1,createTime:-1});

mongoose.model('User', UserSchema);