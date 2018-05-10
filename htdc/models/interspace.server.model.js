/**
 * 空间表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var InterspaceSchema = new mongoose.Schema({
    interspaceName:String,        //空间名字
    interspaceAddress:String,     //空间地址
    interspacePic:Array,          //空间图片
    linkman:String,               //空间联系人
    linkPhone:String,            //空间联系电话
    linkemail:String,        //联系邮箱
    content:String,      //编辑
    url:String,    //链接
    interspaceInfo:{type:String,default:''},   //简介
    isInitialize:String,    //是否初始化1已初始化0未初始化
    interspaceFacility:{type:Array,default:[]}, //空间设施
    member:{type:Array,default:[]},  //团队成员
    createTime:Number,             //时间
});
mongoose.model('Interspace', InterspaceSchema);