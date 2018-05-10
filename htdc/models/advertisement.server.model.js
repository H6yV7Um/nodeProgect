/**
 * 广告表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var AdvertisementSchema = new mongoose.Schema({
    place:Number,                       //广告位置.1主页面2次页面
    type:Number,                        //广告类型.
    picUrl:String,                      //广告图片的Url.图片大小为750*300像素
    data:String,                        //广告信息，url
    createTime:Number,
});
mongoose.model('Advertisement', AdvertisementSchema);