/**
 * 管理员表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Adminchema = new mongoose.Schema({
	nickName:String,                                //姓名
	gender:Number,                                  //性别
	language:String,                                //语言
	city:String,                                    //城市
	province:String,                                //省
	country:String,                                 //国家
	avatarUrl:String,                               //头像
	openId:String,                                  //openid
	createTime:Number,                              //创建时间
});

Adminchema.index({openId: 1});

mongoose.model('Admin', Adminchema);