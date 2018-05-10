/**
 * 初心咖啡类型表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CtypeSchema = new mongoose.Schema({
    name:String,           //赛道名称
    createTime:Number,
});
mongoose.model('Ctype', CtypeSchema);