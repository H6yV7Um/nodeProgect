/**
 * 活动表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var LinkSchema = new mongoose.Schema({
    interspaceId:String,   //空间id
    linkPhone:String,     //联系电话
    serviceType:String,   //服务类型
    createTime:{type:Number,default:Date.now()},    //发布时间
});
mongoose.model('Link', LinkSchema);