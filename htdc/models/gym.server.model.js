/**
 * 健身房表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var GymSchema = new mongoose.Schema({
    gymName:String,                  //健身房名字
    interspaceId:String,             //空间id
    startTime:Number,                //开放时间
    endTime:Number,                 //结束时间
    lockMac:String,   //锁的mac
    price1:Number,                  //入驻企业有期权价格
    price2:Number,              //入驻企业无期权价格
    price3:Number,            //普通用户价格
    personNum:Number,              //人数
    gymPic:String,                  //健身房图片
    roomInfo:String,                 //详情
    address:String,                //地址
    createTime:Number,             //创建时间
});
mongoose.model('Gym', GymSchema);