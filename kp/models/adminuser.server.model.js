/**
 * 后台用户表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var AdminuserSchema = new Schema({
    account:String,       //账号
    password:String,       //密码
    createTime:Number              //创建时间
});


mongoose.model('Adminuser', AdminuserSchema);

