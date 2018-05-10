/**
 * 开锁设备表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var LockSchema = new mongoose.Schema({
    interspaceId:String,   //空间id
    mac:String,           //设备mac地址（唯一）
    lockName:String,     //锁名
    roomId:String,       //房间id
    roomName:String,     //房间编号
    createTime:Number,    //发布时间
});
mongoose.model('Lock', LockSchema);