/**
 * 订单表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var OrderSchema = new mongoose.Schema({
    interspaceId:String,    //店铺所属空间id
    userId:String,    //订单所有者userid
    userPhone:String,
    orderNo:String,       //订单号
    address:{
        userName:String,
        phone:String,
        addressinfo:String,
    },
    goodsinfo:Array,      //商品详情
    shopPostage:Number,     //配送费
    remark:String,         //备注
    orderStatus:String,     //订单状态
    finalPrice:Number,      //最终价格
    createTime:Number,      //订单生成时间
    ordertype:Number,       //订单类型1商品2服务
    expireTime:Number,      //订单到期时间
    paytype:String,         //支付方式'wallet'钱包支付'wx'微信支付'alipay'支付宝支付
    diliverymanName:String,
    diliverymanPhone:String,
});


mongoose.model('Order', OrderSchema);

