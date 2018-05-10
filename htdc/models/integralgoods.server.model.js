/**
 * 积分商品表Schema
 */
var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;
var IntegralgoodsSchema = new mongoose.Schema({
    goodsOrder:Number,  //商品序号
    userId:String,    //商品所有者userid
    interspaceId:String,    //商品所属空间id
    goodsName:String,    //商品名称
    goodsDescribe:String,   //商品描述
    goodsInfo:String,       //商品详情
    goodsPic:String,        //商品展示图
    integral:Number,       //积分数
    createTime:Number,
    //规格
});


mongoose.model('Integralgoods', IntegralgoodsSchema);

