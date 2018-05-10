/**
 * 资讯表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var MessageSchema = new mongoose.Schema({
    title:String,      //标题
    image:String,      //图片
    content:String,    //服务内容
    url:String,       //链接地址
    createTime:{type:Number,default:Date.now()},  //时间
});


mongoose.model('Message', MessageSchema);

