/**
 * 相册用户表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var FlockUserSchema = new mongoose.Schema({
	openGId:String,                                 //群openId
	openId:String,                                  //用户openId
	createTime:Number,                              //关联时间
});

FlockUserSchema.index({openGId : 1, openId : 1,createTime: -1});

mongoose.model('FlockUser', FlockUserSchema);