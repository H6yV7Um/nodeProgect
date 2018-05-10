/**
 * 打印复印、加班预约表Schema
 */
var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;
var PrintSchema = new mongoose.Schema({
    userId:String,         //userid
    interspaceId:String,    //空间id
    interspaceName:String,    //空间名
    type:String,      //1加班预约2打印复印
    date:Number,    //复印打印、加班预约日期
    number:Number,   //打印复印张数
    officeId:String,   //加班预约的办公室id
    officeName:String,  //加班预约的办公室name
    orderNo:String, //订单号
    startTime:Number,     //加班预约开始时间
    endTime:Number,       //加班预约结束时间
    createTime:Number,  //时间
});

mongoose.model('Print', PrintSchema);

