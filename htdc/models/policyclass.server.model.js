/**
 * 政策类型表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var PolicyclassSchema = new mongoose.Schema({
    image:String,      //图片
    backgroundImage:String, //背景图片
    name:String,       //类别名字
    createTime:{type:Number,default:Date.now()},  //时间
});


mongoose.model('Policyclass', PolicyclassSchema);

