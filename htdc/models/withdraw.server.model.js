/**
 * 提现表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var WithdrawSchema = new mongoose.Schema({
    userId:String,            //userid
    account:String,
    orderNo:String,            //订单号(T)
    amount:Number,        //提现金额
    openid:String,            //提现账户的openid
    createTime:Number,         //申请提现时间
    withdrawTime:Number,       //提现到账
    iswithdraw:Number,        //是否提现成功1成功0未成功
});


mongoose.model('Withdraw', WithdrawSchema);

