/**
 * 立体媒体服务表Schema
 */
var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;
var MediaSchema = new mongoose.Schema({
    interspaceId:String,    //空间id
    index:String,
    picLogo:String,    //服务logo图片
    content:String,    //服务内容
    createTime:Number,  //时间
});


mongoose.model('Media', MediaSchema);

