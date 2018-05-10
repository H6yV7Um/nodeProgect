/**
 * 店铺表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var AdminuserSchema = new mongoose.Schema({
    account:String,     //用户账号（手机号）
    salt:String,       //盐
    password:String,    //密码
    userName:String,       //用户名
    interspaceId:String,    //空间id
    authorization:Array,   //权限
    identity:String,     //身份1超级用户2空间管理者3超级管理员分配的账号4空间管理员分配的账号
    nickName:String,     //昵称
    createTime:Number,
});
mongoose.model('Adminuser', AdminuserSchema);

