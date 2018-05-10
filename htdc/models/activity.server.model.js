/**
 * 活动表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ActivitySchema = new mongoose.Schema({
    name:String,           //活动标题
    linkPlace:String,   //链接
    startTime:String,    //开始时间
    endTime:String,     //结束时间
    picUrl:String,     //图片
    hotTime:Number,    //置顶时间
    isHot:{type:Number,default:0},  //是否置顶
    createTime:{type:Number,default:Date.now()},    //发布时间
});
mongoose.model('Activity', ActivitySchema);