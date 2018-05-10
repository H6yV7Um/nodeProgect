/**
 * 群相册批次图片表Schema
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var PhotoSchema = new mongoose.Schema({
	albumId:String,                              //相册objectId
	downloadUrl:String,                               //相册下载地址
	fileId: String,                    //图片key值
	patchId:String,                //上传批次
	createTime:Number,                                 //创建时间
	isShow:Number,                               //是否显示.默认为1
});

PhotoSchema.index({patchId : 1,albumId:1,fileId:1,createTime:-1});

mongoose.model('Photo', PhotoSchema);