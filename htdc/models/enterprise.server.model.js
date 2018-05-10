/**
 * 商家入驻表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var EnterpriseSchema = new mongoose.Schema({
    userId:String,        //userid
    interspaceId:String,  //空间idz
    businessLicensePic:String,   //营业执照图片
    businessLogo:String,    //公司logo
    priseName:String,   //公司名称
    content:String,
    url:String,
    operation:String,  //业务领域
    originatorName:String,   //创始人姓名
    originatorPhone:String,  //创始人手机
    priseInfo:String,       //公司简介
    productName:String,     //产品名称
    teamMembers:Number,     //团队成员数
    needStation:Number,        //所需工位
    freeboardroom:Number,          //免费会议室
    freeroadshow:Number,           //免费路演厅
    isRegister:Number,      //是否注册公司1是2不是
    isCheck:Number,         //是否审核0：没有 1：有 2：删除
    isRecommend:String,     //是否推荐到首页1是0不是
    mien:{type:Array,default:[]},             //公司风采
    createTime:Number,             //时间
});
mongoose.model('Enterprise', EnterpriseSchema);