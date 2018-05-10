/**
 * 意见反馈表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var FeedbackSchema = new mongoose.Schema({
	content:String,
	phone:String,
	isResolved:Number,              //是否已处理.0未处理,1已处理
	createTime:Number,
});

FeedbackSchema.index({createTime : -1, isResolved: 1});

mongoose.model('Feedback', FeedbackSchema);