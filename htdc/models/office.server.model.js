/**
 * 办公室室表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var OfficeSchema = new mongoose.Schema({
    interspaceId:String,  //空间id
    lockMac:String,   //锁的mac
    name:String,   //办公室名称
    picUrl:String,
    createTime:Number,             //时间
});
mongoose.model('Office', OfficeSchema);