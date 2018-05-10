/**
 * 招聘表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var InvitejobSchema = new mongoose.Schema({
    interspaceId:String,  //空间id
    businessName:String,           //公司名称
    businessInfo:String,   //公司简介
    jobName:String,    //职位名称
    request:String,     //职位要求
    salary:String,     //薪资
    welfare:String,        //公司福利
    linkman:String,     //联系人
    phone:String,     //联系电话
    email:String,       //邮箱
    createTime:Number,    //发布时间
});
mongoose.model('Invitejob', InvitejobSchema);