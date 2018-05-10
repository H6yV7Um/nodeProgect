/**
 * 创业服务表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ServiceclassSchema = new mongoose.Schema({
    interspaceId:String,    //店铺所属空间id
    order:Number,        //排序
    pic:String,            //图标
    name:String,           //名称
    index:Number,                  //公共分类排序
});
mongoose.model('Serviceclass', ServiceclassSchema);