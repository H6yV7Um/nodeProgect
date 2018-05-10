/**
 * 卡券表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CouponSchema = new mongoose.Schema({
    userId:String,    //用户id
    type:Number,    //1免费券2折扣券
    money:Number,   //卡券金额
    consumerCode:String,   //消费码
    isUse:{type:Number,default:0},  //是否使用
    createTime:{type:Number,default:Date.now()},  //时间
});


mongoose.model('Coupon', CouponSchema);

