/**
 * 各种办公室预约表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var OfficeorderSchema = new mongoose.Schema({
    userId:String,  //userid
    userPhone:String, //用户手机号
    interspaceId:String,    //空间id
    interspaceName:String,    //空间名
    coffeeShopId:String,          //咖啡分店id
    address:{
        userName:String,
        phone:String,
        addressinfo:String,
    },
    useInfo:String,//消费码使用说明
    orderNo:String, //订单号
    type:String,   //
    goodsId:String,  //预定商品的id
    orderStatus:String,  //订单状态
    orderAmount:Number,  //订单金额
    orderInfo:Array,  //预约详情
    deposit:Number,    //押金
    isreturn:Number,   //是否退还押金
    orderTime:Number,    //预约时间
    coachPhone:String,    //教练电话
    consumerCode:String,    //消费码
    integralNum:Number,    //抵扣积分数
    integralFee:Number,    //抵扣积分金额数
    remark:String,             //备注
    paytype:String,         //支付方式'wallet'钱包支付'wx'微信支付'alipay'支付宝支付
    createTime:Number,             //时间
});
mongoose.model('Officeorder', OfficeorderSchema);