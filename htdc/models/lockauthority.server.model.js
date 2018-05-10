/**
 * 开锁权限表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var LockauthoritySchema = new mongoose.Schema({
    mac:String,           //设备mac地址（唯一）
    roomId:String,       //房间id
    userId:String,       //用户id
    type:String,         //1永久性的2非永久性的
    stationids:Array,    //工位id
    priseId:String,       //企业id
    startTime:Number,    //非永久性的开始时间
    endTime:Number,      //非永久性的到期时间
    orderId:String,      //订单id
    createTime:Number,    //发布时间
});

mongoose.model('Lockauthority', LockauthoritySchema);