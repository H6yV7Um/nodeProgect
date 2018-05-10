/**
 * 政策表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var PolicySchema = new mongoose.Schema({
    pilicyClassId:String,
    title:String,      //标题
    content:String,    //服务内容
    url:String,       //链接地址
    createTime:{type:Number,default:Date.now()},  //时间
});


mongoose.model('Policy', PolicySchema);

