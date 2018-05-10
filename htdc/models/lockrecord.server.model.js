/**
 * 开锁记录表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var LockrecordSchema = new mongoose.Schema({
    interspaceId:String,  //空间id
    lockMac:String,           //设备mac地址（唯一）
    userId:String,       //用户id
    cardNo:Number,       //开锁记录号
    openStatus:String,        //
    createTime:Number,    //开锁时间
});
mongoose.model('Lockrecord', LockrecordSchema);