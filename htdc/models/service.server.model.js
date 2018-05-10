/**
 * 创业服务表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ServiceSchema = new mongoose.Schema({
    serviceClassId:String,    //分类id
    logo:String,            //图标
    name:String,           //名称
    address:String,       //地址
    linkPhone:String,     //联系方式
    serviceInfo:String,    //详情
    serviceContent:Array,   //服务内容
    createTime:{type:Number,default:Date.now()}
});
//serviceContent
//{
// name:String,
// info:String,
// price:String,
// }
mongoose.model('Service', ServiceSchema);