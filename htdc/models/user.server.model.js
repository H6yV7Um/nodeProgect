/**
 * 用户表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var UserSchema = new mongoose.Schema({
    txyId:String,                    //腾讯云id
    account:String,                  //账号
    nickName:String,              //姓名
    headimgUrl:String,            //头像
    sex:Number,                   //性别
    bindPhone:String,           //绑定的手机号
    authenticationStatus:Number,  //认证状态0未认证1认证有期权员工2认证有期权的企业管理者3认证没有期权员工4认证没有期权的企业管理者
    identity:String,                //身份
    interspaceId:String,           //所属空间id
    address:String,                //收货地址
    linkPhone:String,             //联系电话
    enterpriseId:String,         //入驻企业id
    integral:{type:Number,default:0},                //积分数
    isDaySignin:{type:Number,default:0},  //是否每日签到
    isCashCoupon:{type:Number,default:1},  //是否已领取卡券
    level:Number,                   //用户等级
    money:{type:Number,default:0},                   //钱包金额（分）
    paySalt:String,                 //支付的盐
    payPassword:String,             //支付密码
    createTime:Number,             //时间
});
mongoose.model('User', UserSchema);