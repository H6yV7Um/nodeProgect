/**
 * 积分兑换商品订单表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var IntegralgoodsorderSchema = new mongoose.Schema({
    interspaceId:String,    //店铺所属空间id
    userId:String,    //订单所有者userid
    userPhone:String,
    orderNo:String,       //订单号
    goodsName:String,
    goodsPic:String,
    orderStatus:String,     //订单状态
    consumerCode:String,    //消费码
    finalPrice:Number,      //最终价格
    createTime:Number,      //订单生成时间
});


mongoose.model('Integralgoodsorder', IntegralgoodsorderSchema);

