/**
 * 立体媒体服务表Schema
 */
var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;
var MediaserverSchema = new mongoose.Schema({
    mediaId:String,    //媒体服务id
    data:String,  
    content:String,    //服务内容
    createTime:Number,  //时间
});

mongoose.model('Mediaserver', MediaserverSchema);

