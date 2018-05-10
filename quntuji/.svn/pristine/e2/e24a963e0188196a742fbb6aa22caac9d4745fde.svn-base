/**
 * 用户订单表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var OrderSchema = new mongoose.Schema({
	ownerId:String,                             //拥有者用户Id
	orderNo:String,                             //订单号
	status:Number,                              //订单状态,0未付款,1已付款
	source:String,								//订单来源。M会员充值；A相册查看
	content:Schema.Types.Mixed,                 //订单内容.若订单来源为“M会员充值”，则content内容为：{vipLevel:Number,timeLength:Number};vipLevel值域为1-3，timeLength值域为0-5
												//若订单来源为“A相册查看”，则content内容为：{albumId:String};
	price:Number,                               //订单总价(元)
	createTime:Number,                          //生成时间
	payTime:Number,                             //付款时间
});

OrderSchema.index({ownerId : 1, orderNo : 1,status: -1,source:1,createTime:-1,payTime:-1});

mongoose.model('Order', OrderSchema);