/**
 * 公司广告表
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CompanySchema = new mongoose.Schema({
    name:String,
    picUrl:String,
    startTime:Number,
    createTime:Number,
    linkPlace:String
});
mongoose.model('Company', CompanySchema);