/**
 * 立体媒体服务订单表Schema
 */
var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;
var MediaorderSchema = new mongoose.Schema({
    interspaceId:String,   //空间id
    userId:String,    //用户id
    userPhone:String,   //用户手机
    orderInfo:Array,    //订单内容
    isDispose:String,   //订单是否处理0没有1已处理
    createTime:Number,  //时间
});

mongoose.model('Mediaorder', MediaorderSchema);

