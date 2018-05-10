/**
 * 咖啡店商品表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CgoodsSchema = new mongoose.Schema({
    name:String,           //
    typeId:String,
    picUrl1:String,     //小图
    picUrl2:String,      //大图
    info:String,
    sales:Number,
    useinfo:String,     //使用说明
    price1:Number,
    price2:Number,
    price3:Number,
    createTime:Number,
});
mongoose.model('Cgoods', CgoodsSchema);