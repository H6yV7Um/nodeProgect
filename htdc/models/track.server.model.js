/**
 * 赛道表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TrackSchema = new mongoose.Schema({
    name:String,           //赛道名称
    picUrl1:String,       //静态
    picUrl2:String,       //  动态
    createTime:Number,
});
mongoose.model('Track', TrackSchema);