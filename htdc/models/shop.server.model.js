/**
 * 店铺表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ShopSchema = new mongoose.Schema({
    userPhone:String,      //店铺用户手机号
    shopType:Number,        //店铺类别
    interspaceId:String,    //店铺所属空间id
    createTime:Number,             //时间
});
mongoose.model('Shop', ShopSchema);