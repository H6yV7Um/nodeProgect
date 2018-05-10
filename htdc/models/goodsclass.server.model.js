/**
 * 分类表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var GoodsclassSchema = new mongoose.Schema({
    interspaceId:String,    //店铺所属空间id
    classOrder:Number,         //分类排序
    className:String,         //分类名字
    type:Number,             //1商品2服务
    iscommon:Number,              //是否是公共分类0不是1是
    createTime:Number,             //时间
    index:Number,                  //公共分类排序
});
mongoose.model('Goodsclass', GoodsclassSchema);