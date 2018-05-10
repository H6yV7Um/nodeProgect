/**
 * 财务表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var FinanceSchema = new mongoose.Schema({
    userId:String,         //userid
    interspaceId:String,    //空间id
    type:String,           //100充值101提现200路演听押金退还300订单退款
    amount:Number,        //金额(分)
    orderNo:String,                //订单号
    channel:String,                //充值方式
    financeway:{type:Number,default:1}, //1支出2收入
    goodsId:String,
    goodsName:String,
    coffeeShopId:String,          //咖啡分店id
    isPaied:Number,                //是否支付成功 1成功0未成功
    createTime:Number,             //时间
});
mongoose.model('Finance', FinanceSchema);