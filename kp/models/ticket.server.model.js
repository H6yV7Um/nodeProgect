/**
 * 票表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TicketSchema = new Schema({
    ticketNo:String,                //票号  6位数字
    ticketType:{type:Number,default:1},              //票类   1学生票 2成人票 3vip票
    price:String,                   //票价
    isSale:{type:Number,default:0},              //是否卖出  0没有 1卖出

    name:String,                    //购买人姓名
    identity:String,                //购买人身份证号
    orderNo:String,                 //订单号
    channel:{type:Number,default:1},  //购买渠道   1京东收货点  2雷锋哥
    way:String,                     //购买方式   WeiXIN  Alipay
    saleTime:Number,              //卖出时间
    createTime:{type:Number,default:Date.now()}              //创建时间
});


mongoose.model('Ticket', TicketSchema);

