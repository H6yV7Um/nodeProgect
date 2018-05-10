/**
 * 咖啡店
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CshopSchema = new mongoose.Schema({
    picUrl:String,           //背景图
    linkPlace:String,    //链接地址
    createTime:Number,
});
mongoose.model('Cshop', CshopSchema);