/**
 * AA加速空间表表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TrackinterspaceSchema = new mongoose.Schema({
    name:String,           //活动标题
    imgUrl:String,        //图片
    adress:String,        //详细地址
    data:String,          //详细信息
    createTime:Number,    //发布时间
});
mongoose.model('Trackinterspace', TrackinterspaceSchema);