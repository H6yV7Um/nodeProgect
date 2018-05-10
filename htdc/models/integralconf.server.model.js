/**
 * 商家入驻表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var IntegralconfSchema = new mongoose.Schema({
    getIntegralWay:Array,     //积分获取方式
    integralFee:Number,       //积分兑换金额1元=？积分
    createTime:{type:Number,default:Date.now()},             //时间
});
mongoose.model('Integralconf', IntegralconfSchema);