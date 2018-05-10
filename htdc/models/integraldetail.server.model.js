/**
 * 商家入驻表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var IntegraldetailSchema = new mongoose.Schema({
    userId:String,        //userid
    integralWay:Number,          //1获得积分2消费积分
    integralType:String,          //a1新用户注册a2每日签到a3消费b1
    goodsName:String,          //消费的产品名称
    integralNum:Number,      //积分数
    createTime:{type:Number,default:Date.now()},             //时间
});
mongoose.model('Integraldetail', IntegraldetailSchema);