/**
 * 员工申请入驻表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var StaffapplyforSchema = new mongoose.Schema({
    userId:String,        //userid
    priseId:String,  //企业id
    priseOwnerId:String,   //企业管理者id
    userName:String,      //申请人姓名
    userIdCard:String,    //身份证号
    positivePic:String,     //身份证正面照
    negativePic:String,     //身份证反面照
    ispass:String,        //是否通过0未通过1通过2拒绝3审核中
    createTime:Number,             //时间
});
mongoose.model('Staffapplyfor', StaffapplyforSchema);